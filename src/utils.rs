use leptos::wasm_bindgen::JsCast;
use leptos::wasm_bindgen::closure::Closure;
use send_wrapper::SendWrapper;

/// Check whether the user has requested reduced motion.
///
/// Defaults to `false` if the media query cannot be evaluated.
#[must_use]
pub fn prefers_reduced_motion() -> bool {
    leptos::web_sys::window()
        .and_then(|w| w.match_media("(prefers-reduced-motion: reduce)").ok())
        .flatten()
        .is_some_and(|mql| mql.matches())
}

/// Apply a `reduced-motion` class to the document element when the user
/// prefers reduced motion.
///
/// This lets CSS and JS share a single, consistent signal in addition to the
/// standard `prefers-reduced-motion` media query.
pub fn apply_reduced_motion_class() {
    if !prefers_reduced_motion() {
        return;
    }
    let Some(document) = leptos::web_sys::window().and_then(|w| w.document()) else {
        return;
    };
    if let Some(html) = document.document_element() {
        let _ = html.class_list().add_1("reduced-motion");
    }
}

/// Add a listener to the browser `window` and automatically remove it when
/// the surrounding effect is cleaned up.
///
/// Returns `true` if the listener was successfully registered.
pub fn window_event_listener<E, F>(event: &'static str, mut handler: F) -> bool
where
    E: JsCast + 'static,
    F: FnMut(E) + 'static,
{
    let Some(window) = leptos::web_sys::window() else {
        return false;
    };
    let closure = SendWrapper::new(Closure::wrap(Box::new(move |ev: leptos::web_sys::Event| {
        if let Ok(typed) = ev.dyn_into::<E>() {
            handler(typed);
        }
    }) as Box<dyn FnMut(_)>));

    let fn_ref: js_sys::Function = (*closure)
        .as_ref()
        .unchecked_ref::<js_sys::Function>()
        .clone();
    if window
        .add_event_listener_with_callback(event, &fn_ref)
        .is_err()
    {
        return false;
    }

    leptos::prelude::on_cleanup(move || {
        if let Some(window) = leptos::web_sys::window() {
            let _ = window.remove_event_listener_with_callback(event, &fn_ref);
        }
        drop(closure);
    });

    true
}

/// Observe the intersection of a set of elements and call the provided
/// callback whenever the observed state changes.
///
/// `threshold` is a value between 0.0 and 1.0 that controls how much of an
/// element must be visible before the observer fires. A threshold of 0.0
/// fires as soon as a single pixel is visible; 1.0 requires the entire
/// element to be visible.
///
/// The observer is disconnected when the surrounding effect is cleaned up.
/// Returns `true` if the observer was successfully created and started.
pub fn observe_intersections<F>(
    elements: &[leptos::web_sys::Element],
    threshold: f64,
    mut callback: F,
) -> bool
where
    F: FnMut(&[leptos::web_sys::IntersectionObserverEntry]) + 'static,
{
    if leptos::web_sys::window().is_none() {
        return false;
    }

    let closure = SendWrapper::new(Closure::wrap(Box::new(move |entries: js_sys::Array| {
        let typed: Vec<leptos::web_sys::IntersectionObserverEntry> = entries
            .iter()
            .filter_map(|entry| {
                entry
                    .dyn_into::<leptos::web_sys::IntersectionObserverEntry>()
                    .ok()
            })
            .collect();
        callback(&typed);
    }) as Box<dyn FnMut(_)>));

    let options = leptos::web_sys::IntersectionObserverInit::new();
    let threshold = threshold.clamp(0.0, 1.0);
    options.set_threshold(&js_sys::Array::of1(&js_sys::Number::from(threshold)));

    let Some(observer) = leptos::web_sys::IntersectionObserver::new_with_options(
        (*closure).as_ref().unchecked_ref(),
        &options,
    )
    .ok() else {
        return false;
    };

    for element in elements {
        observer.observe(element);
    }

    leptos::prelude::on_cleanup(move || {
        observer.disconnect();
        drop(closure);
    });

    true
}

/// Strip a `-dirty` suffix from a Git SHA, if present.
#[must_use]
pub fn clean_sha(sha: &str) -> &str {
    sha.strip_suffix("-dirty").unwrap_or(sha)
}

/// Return a Tailwind color class for a programming language name.
///
/// Unknown languages fall back to a neutral base-content badge.
#[must_use]
pub fn language_color(language: &str) -> &'static str {
    match language {
        "Rust" => "bg-[#dea584]",
        "TypeScript" => "bg-[#3178c6]",
        "JavaScript" => "bg-[#f1e05a]",
        "Python" => "bg-[#3572A5]",
        "HTML" => "bg-[#e34c26]",
        "CSS" => "bg-[#563d7c]",
        "Java" | "java" => "bg-[#b07219]",
        "Go" => "bg-[#00ADD8]",
        "C" => "bg-[#555555]",
        "C++" => "bg-[#f34b7d]",
        "Kotlin" => "bg-[#A97BFF]",
        "QML" => "bg-[#44a51c]",
        _ => "bg-base-content/50",
    }
}
