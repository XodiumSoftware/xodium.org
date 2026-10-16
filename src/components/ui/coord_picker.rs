use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;
use leptos::web_sys;

/// Page-grid geometry constants, mirrored from the CSS layout in
/// `public/style.css`:
/// - The frame's inner border sits at `inset: 16px` with a 2px line, so the
///   drawing area starts 18px from the viewport edge.
/// - The body-wide blueprint grid uses a 60px major pitch / 12px minor pitch.
///
/// Coordinates reported by the picker are major-cell indices, with the
/// origin at the bottom-left intersection of the drawing area so the system
/// matches the isometric viewport's (A/1) zone convention.
const GRID_INSET: i32 = 18;
const GRID_MAJOR: i32 = 60;

/// Lossless-enough f64 → i32 used when adapting pixel values from the
/// browser.
///
/// Browser geometry (`inner_width`, `client_x`) is a non-negative,
/// integer-valued f64 well within i32 range; saturating via `trunc` and
/// `try_from` avoids the `clippy::cast_possible_truncation` lint while
/// keeping one code path instead of three fallible conversions.
///
/// Shared with other components that need to resolve pixel geometry into
/// integer page coordinates (e.g. the viewport frame marker balloons).
pub(crate) fn to_i32_saturated(value: f64) -> Option<i32> {
    if value.is_finite() && value >= f64::from(i32::MIN) && value <= f64::from(i32::MAX) {
        #[allow(clippy::cast_possible_truncation)]
        Some(value.trunc() as i32)
    } else {
        None
    }
}

/// One click's snapped coordinate - major-cell indices with origin at the
/// bottom-left of the drawing area.
#[derive(Clone, Copy, PartialEq)]
struct Coord {
    /// Major-cell column index, starting at 0 on the left edge.
    x: i32,
    /// Major-cell row index, starting at 0 on the bottom edge (Y up).
    y: i32,
    /// Absolute pixel position of the snapped intersection, in viewport
    /// coordinates (used to anchor the marker balloon on screen).
    px: i32,
    py: i32,
}

/// Interactive coordinate picker over the page grid.
///
/// Listens for clicks anywhere on the page, snaps to the nearest major grid
/// intersection, and drops a marker balloon at that point showing the
/// snapped coordinate ("(X, Y)" in major-cell units, origin bottom-left).
/// Clicking again moves the marker. Esc clears it.
///
/// Snapping happens inside the single window-level click handler (rather
/// than via hundreds of invisible hit-target elements) and rounds to the
/// nearest major gridline by adding half a cell before `div_euclid`, which
/// converts truncation into round-to-nearest.
///
/// Purely a debug aid - the marker is aria-hidden and pointer-events-none;
/// the picker itself is invisible chrome on top of the blueprint grid.
///
/// The window listeners are attached once and leaked via `Closure::forget`,
/// keeping them alive for the lifetime of the page. The picker is
/// app-lifetime chrome, so this doesn't leak user-visible state.
#[component]
#[must_use]
pub fn CoordPicker() -> impl IntoView {
    let (coord, set_coord) = signal(Option::<Coord>::None);

    let on_click = move |ev: web_sys::MouseEvent| {
        let Some(window) = web_sys::window() else {
            return;
        };

        let px = ev.client_x();
        let py = ev.client_y();

        let Some(viewport_w) = window
            .inner_width()
            .ok()
            .and_then(|v| v.as_f64())
            .and_then(to_i32_saturated)
        else {
            return;
        };
        let Some(viewport_h) = window
            .inner_height()
            .ok()
            .and_then(|v| v.as_f64())
            .and_then(to_i32_saturated)
        else {
            return;
        };
        if viewport_w <= 0 || viewport_h <= 0 {
            return;
        }

        let area_w = viewport_w - 2 * GRID_INSET;
        let area_h = viewport_h - 2 * GRID_INSET;

        let rel_x = px - GRID_INSET;
        let rel_y = py - GRID_INSET;

        let snap_col = (rel_x + GRID_MAJOR / 2).div_euclid(GRID_MAJOR);
        let snap_row_top = (rel_y + GRID_MAJOR / 2).div_euclid(GRID_MAJOR);

        let snapped_px = GRID_INSET + snap_col * GRID_MAJOR;
        let snapped_py_top = GRID_INSET + snap_row_top * GRID_MAJOR;

        let visible_rows = area_h / GRID_MAJOR;
        let snap_y = visible_rows - snap_row_top;
        let snap_x = snap_col;

        if rel_x < 0
            || rel_y < 0
            || snapped_px > GRID_INSET + area_w
            || snapped_py_top > GRID_INSET + area_h
        {
            return;
        }

        set_coord.set(Some(Coord {
            x: snap_x,
            y: snap_y,
            px: snapped_px,
            py: snapped_py_top,
        }));
    };

    let on_keydown = move |ev: web_sys::KeyboardEvent| {
        if ev.key() == "Escape" {
            set_coord.set(None);
        }
    };

    Effect::new(move |_| {
        use leptos::wasm_bindgen::closure::Closure;

        let Some(window) = web_sys::window() else {
            return;
        };

        let click_closure = Closure::wrap(Box::new(on_click) as Box<dyn FnMut(_)>);
        let _ = window
            .add_event_listener_with_callback("click", click_closure.as_ref().unchecked_ref());
        click_closure.forget();

        let key_closure = Closure::wrap(Box::new(on_keydown) as Box<dyn FnMut(_)>);
        let _ = window
            .add_event_listener_with_callback("keydown", key_closure.as_ref().unchecked_ref());
        key_closure.forget();
    });

    view! {
        {move || coord.get().map(|c| view! {
            <div
                class="coord-marker"
                style={format!("left: {}px; top: {}px;", c.px, c.py)}
                aria-hidden="true"
            >
                <span class="coord-marker-dot"></span>
                <span class="coord-marker-label font-mono">
                    {format!("({}, {})", c.x, c.y)}
                </span>
            </div>
        })}
    }
}
