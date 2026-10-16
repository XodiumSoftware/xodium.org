use crate::contexts::scene::SceneContext;
use leptos::prelude::*;

const DBLCLICK_WINDOW_MS: f64 = 400.0;

/// Collective viewport that hosts any number of [`crate::Object3d`] children
/// and owns the shared pan/zoom state. Drag with any mouse button pans the
/// whole scene; mouse wheel zooms around the centre; double-tapping the
/// middle button within 400ms resets the view to 1:1 centred (the UI Events
/// spec only fires `dblclick` for the primary button, so the middle-button
/// double-tap is detected by hand). When a drag ends after moving more than
/// 4 pixels, `last_drag_end` is stamped so the click that immediately follows
/// does not also toggle an object's pinned state.
#[component]
#[must_use]
pub fn Object3dScene(children: Children) -> impl IntoView {
    const ZOOM_MIN: f64 = 0.25;
    const ZOOM_MAX: f64 = 4.0;
    const ZOOM_STEP: f64 = 1.1;

    let (zoom, set_zoom) = signal(1.0f64);
    let (pan, set_pan) = signal((0.0f64, 0.0f64));
    let (drag_origin, set_drag_origin) = signal(Option::<(f64, f64, f64, f64)>::None);
    let (last_middle_up, set_last_middle_up) = signal(0.0f64);
    let (last_drag_end, set_last_drag_end) = signal(0.0f64);

    provide_context(SceneContext { last_drag_end });

    view! {
        <section
            class="object-3d-scene"
            aria-label="Drawing viewport"
            on:wheel=move |ev| {
                ev.prevent_default();
                let factor = if ev.delta_y() < 0.0 { ZOOM_STEP } else { 1.0 / ZOOM_STEP };
                set_zoom.update(|z| {
                    *z = (*z * factor).clamp(ZOOM_MIN, ZOOM_MAX);
                });
            }
            on:pointerdown=move |ev| {
                let (px, py) = pan.get();
                set_drag_origin.set(Some((
                    f64::from(ev.client_x()),
                    f64::from(ev.client_y()),
                    px,
                    py,
                )));
            }
            on:pointermove=move |ev| {
                if let Some((sx, sy, px, py)) = drag_origin.get() {
                    if ev.buttons() == 0 {
                        set_drag_origin.set(None);
                        return;
                    }
                    let dx = f64::from(ev.client_x()) - sx;
                    let dy = f64::from(ev.client_y()) - sy;
                    set_pan.set((px + dx, py + dy));
                }
            }
            on:pointerup=move |ev| {
                if ev.button() == 1 {
                    let now = js_sys::Date::now();
                    if now - last_middle_up.get() < DBLCLICK_WINDOW_MS {
                        ev.prevent_default();
                        set_pan.set((0.0, 0.0));
                        set_zoom.set(1.0);
                        set_last_middle_up.set(0.0);
                    } else {
                        set_last_middle_up.set(now);
                    }
                }
                if let Some((sx, sy, _, _)) = drag_origin.get() {
                    let dx = f64::from(ev.client_x()) - sx;
                    let dy = f64::from(ev.client_y()) - sy;
                    if (dx * dx + dy * dy).sqrt() > 4.0 {
                        set_last_drag_end.set(js_sys::Date::now());
                    }
                }
                set_drag_origin.set(None);
            }
            on:pointerleave=move |_| set_drag_origin.set(None)
            on:pointercancel=move |_| set_drag_origin.set(None)
        >
            <div
                class="object-3d-layer"
                style=move || {
                    let (px, py) = pan.get();
                    format!("--zoom: {:.3}; --pan-x: {:.2}px; --pan-y: {:.2}px;", zoom.get(), px, py)
                }
            >
                {children()}
            </div>
        </section>
    }
}
