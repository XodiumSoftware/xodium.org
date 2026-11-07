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

/// Reactive signal tracking whether the viewport is at or above `sm`.
///
/// The initial value is read synchronously from `matchMedia`, so the first
/// render is already correct rather than flipping once an effect runs. The
/// listener is removed on cleanup.
///
/// Outside a browser (`matchMedia` unavailable) the signal reports `true`, which
/// is the layout that shows the hero and the tab behaviour: the wider layout is
/// the safer default, since the narrow one omits content.
#[must_use]
pub fn is_at_least_sm() -> ReadSignal<bool> {
    let (narrow, set_narrow) = signal(false);

    let matches = web_sys::window()
        .and_then(|window| window.match_media(SM_QUERY).ok())
        .flatten();

    let Some(query) = matches else {
        return narrow;
    };

    set_narrow.set(query.matches());

    let listener = Closure::<dyn FnMut(web_sys::MediaQueryListEvent)>::new(
        move |event: web_sys::MediaQueryListEvent| set_narrow.set(event.matches()),
    );
    let _ = query.add_event_listener_with_callback(
        "change",
        listener.as_ref().unchecked_ref::<js_sys::Function>(),
    );

    let cleanup_query = query.clone();
    let cleanup_listener = listener.into_js_value();
    on_cleanup(move || {
        let callback: &js_sys::Function = cleanup_listener.unchecked_ref();
        let _ = cleanup_query.remove_event_listener_with_callback("change", callback);
    });

    narrow
}
