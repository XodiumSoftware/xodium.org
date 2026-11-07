//! Viewport breakpoints shared by markup and behaviour.
//!
//! Tailwind's `sm` breakpoint drives several CSS rules, but a few components need
//! the same answer in Rust: the hero is hidden below `sm`, and the main projects
//! marks stop acting as tabs there because they would select something no longer
//! on the page. Keeping the query in one place means the markup and the CSS
//! cannot drift apart.

use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast as _;
use leptos::wasm_bindgen::closure::Closure;

/// Tailwind's `sm` breakpoint, the width at which the sheet stops stacking.
const SM_QUERY: &str = "(width >= 40rem)";

/// Asks the browser once whether `query` currently matches.
fn matches(query: &str) -> bool {
    web_sys::window()
        .and_then(|window| window.match_media(query).ok())
        .flatten()
        .is_some_and(|list| list.matches())
}

/// Reactive signal tracking whether the viewport is at or above `sm`.
///
/// The signal starts at the value `matchMedia` reports *right now*, so the first
/// render is already correct. It is created already holding that value rather
/// than being updated after creation: a signal mutated immediately after it is
/// created can be read once before the update lands, which rendered the narrow
/// layout on a wide screen.
///
/// Outside a browser (`matchMedia` unavailable) the signal reports `true`, the
/// layout that shows the hero and the tab behaviour, since the narrow layout
/// omits content. The change listener is removed on cleanup.
#[must_use]
pub fn is_at_least_sm() -> ReadSignal<bool> {
    let (wide, set_wide) = signal(matches(SM_QUERY));

    let listener = web_sys::window()
        .and_then(|window| window.match_media(SM_QUERY).ok())
        .flatten()
        .map(|query| {
            let listener = Closure::<dyn FnMut(web_sys::MediaQueryListEvent)>::new(
                move |event: web_sys::MediaQueryListEvent| set_wide.set(event.matches()),
            );
            let _ = query.add_event_listener_with_callback(
                "change",
                listener.as_ref().unchecked_ref::<js_sys::Function>(),
            );
            (query, listener.into_js_value())
        });

    if let Some((query, listener)) = listener {
        on_cleanup(move || {
            let callback: &js_sys::Function = listener.unchecked_ref();
            let _ = query.remove_event_listener_with_callback("change", callback);
        });
    }

    wide
}
