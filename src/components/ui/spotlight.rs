//! Cursor-following light inside hovered controls.

use std::cell::{Cell, RefCell};
use std::rc::Rc;

use leptos::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen::closure::Closure;
use web_sys::{Element, EventTarget, HtmlElement, PointerEvent};

/// Marks an element as spotlighted and stacks its content above the glow.
pub const SPOTLIGHT_SURFACE: &str = "spotlight-surface";

/// Selects the glow inside a spotlight surface.
const GLOW_CLASS: &str = ".spotlight";

/// Horizontal offset of the glow within its surface.
const X_PROPERTY: &str = "--spotlight-x";

/// Vertical offset of the glow within its surface.
const Y_PROPERTY: &str = "--spotlight-y";

/// Glow layer that any element carrying [`SPOTLIGHT_SURFACE`] renders.
#[component]
#[must_use]
pub fn Spotlight() -> impl IntoView {
    view! { <span class="spotlight" aria-hidden="true"></span> }
}

/// Starts tracking the pointer for every spotlight surface.
pub fn track_spotlights() {
    let pending: Rc<RefCell<Option<(EventTarget, f64, f64)>>> = Rc::new(RefCell::new(None));
    let frame: Rc<Cell<Option<i32>>> = Rc::new(Cell::new(None));

    let schedule = {
        let pending = Rc::clone(&pending);
        let frame = Rc::clone(&frame);
        move |event: PointerEvent| {
            let Some(target) = event
                .target()
                .filter(EventTarget::is_instance_of::<Element>)
            else {
                return;
            };
            *pending.borrow_mut() = Some((
                target,
                f64::from(event.client_x()),
                f64::from(event.client_y()),
            ));

            if frame.get().is_some() {
                return;
            }
            let paint_closure = {
                let pending = Rc::clone(&pending);
                let frame = Rc::clone(&frame);
                Closure::once_into_js(move || {
                    frame.set(None);
                    paint(&pending);
                })
            };
            if let Ok(handle) = window().request_animation_frame(paint_closure.unchecked_ref()) {
                frame.set(Some(handle));
            }
        }
    };

    let listener = Closure::<dyn FnMut(PointerEvent)>::new(schedule);
    let events = ["pointermove", "pointerdown"];
    for name in events {
        let _ =
            document().add_event_listener_with_callback(name, listener.as_ref().unchecked_ref());
    }
    listener.forget();
}

/// Paints the last pointer position onto the glow of its surface.
fn paint(pending: &RefCell<Option<(EventTarget, f64, f64)>>) {
    let Some((target, x, y)) = pending.borrow_mut().take() else {
        return;
    };
    let Some(origin) = target.dyn_ref::<Element>() else {
        return;
    };
    let surface = origin
        .closest(&format!(".{SPOTLIGHT_SURFACE}"))
        .ok()
        .flatten();
    let Some(surface) = surface else {
        return;
    };
    let Some(glow) = surface
        .query_selector(GLOW_CLASS)
        .ok()
        .flatten()
        .and_then(|glow| glow.dyn_into::<HtmlElement>().ok())
    else {
        return;
    };
    let bounds = surface.get_bounding_client_rect();
    let _ = glow
        .style()
        .set_property(X_PROPERTY, &format!("{}px", x - bounds.left()));
    let _ = glow
        .style()
        .set_property(Y_PROPERTY, &format!("{}px", y - bounds.top()));
}
