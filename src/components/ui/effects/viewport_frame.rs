use leptos::prelude::*;

/// Page-grid geometry constants, mirrored from `public/style.css` and shared
/// conceptually with [`crate::components::ui::coord_picker`]:
/// - The frame's inner border sits at `inset: 16px` with a 2px line, so the
///   drawing area starts 18px from the viewport edge.
/// - The blueprint grid uses a 60px major pitch.
///
/// Marker positions passed to [`ZoneMarker`] and friends are in major-cell
/// units with origin at the bottom-left of the drawing area.
const GRID_INSET: i32 = 18;
const GRID_MAJOR: i32 = 60;

/// Convert a bottom-origin row index into a top-origin CSS pixel offset,
/// given the current viewport height.
///
/// Matches the `CoordPicker` convention: label `row = 0` is the bottom-most
/// visible major gridline, and `row = N` is N major cells above that. In
/// CSS pixels (top-origin):
///   `GRID_INSET + (visible_rows - row) * GRID_MAJOR`
/// where `visible_rows = (viewport_h - 2*GRID_INSET) / GRID_MAJOR`.
fn row_to_top_px(row: i32, viewport_h: i32) -> i32 {
    let area_h = viewport_h - 2 * GRID_INSET;
    let visible_rows = area_h / GRID_MAJOR;
    GRID_INSET + (visible_rows - row) * GRID_MAJOR
}

/// Convert a left-origin column index into a top-origin CSS pixel offset.
fn col_to_left_px(col: i32) -> i32 {
    GRID_INSET + col * GRID_MAJOR
}

/// Viewport frame — the framed drawing area on the page. Currently an empty
/// surface that hosts the zone marker balloons pinned to specific page-grid
/// intersections; actual drawing content goes inside later.
///
/// Markers are placed absolutely via page-grid coordinates so they anchor
/// exactly on major-grid intersections regardless of viewport size. The
/// component reacts to window resize so markers track the drawing area's
/// bottom edge even as the viewport changes height.
#[component]
#[must_use]
pub fn ViewportFrame() -> impl IntoView {
    // Track viewport height so row coordinates (which are bottom-origin)
    // stay pinned to the correct page grid intersection as the window
    // resizes vertically.
    let (viewport_h, set_viewport_h) = signal(0i32);

    Effect::new(move |_| {
        use leptos::wasm_bindgen::JsCast;
        use leptos::wasm_bindgen::closure::Closure;
        use leptos::web_sys;

        let read_height = move |window: &web_sys::Window| {
            window
                .inner_height()
                .ok()
                .and_then(|v| v.as_f64())
                .and_then(crate::components::ui::coord_picker::to_i32_saturated)
                .unwrap_or(0)
        };

        if let Some(window) = web_sys::window() {
            set_viewport_h.set(read_height(&window));
            let closure = Closure::wrap(Box::new(move || {
                if let Some(w) = web_sys::window() {
                    set_viewport_h.set(read_height(&w));
                }
            }) as Box<dyn FnMut()>);
            let _ =
                window.add_event_listener_with_callback("resize", closure.as_ref().unchecked_ref());
            closure.forget();
        }
    });

    view! {
        <figure class="viewport-frame" aria-label="Drawing frame">
            // Horizontal connector lines: one per row (1..5) spanning from
            // the left-marker anchor at col 13 to the right-marker anchor at
            // col 29, drawn directly between the two opposing anchor dots.
            {(1..=5).map(|n| {
                let row = 4 + 2 * n;
                view! {
                    <AxisConnector
                        orientation="horizontal"
                        at=row
                        from=13
                        to=29
                        viewport_h=viewport_h.into()
                    />
                }
            }).collect::<Vec<_>>()}

            // Vertical connector lines: one per column letter, spanning from
            // the bottom-marker anchor at row 6 to the top-marker anchor at
            // row 14.
            {(0..9).map(|i| {
                let col = 13 + 2 * i;
                view! {
                    <AxisConnector
                        orientation="vertical"
                        at=col
                        from=6
                        to=14
                        viewport_h=viewport_h.into()
                    />
                }
            }).collect::<Vec<_>>()}

            // Row labels 1..5, each with a left + right marker.
            {(1..=5).map(|n| {
                let row = 4 + 2 * n;
                let label: &'static str = match n {
                    1 => "1", 2 => "2", 3 => "3", 4 => "4", 5 => "5",
                    _ => unreachable!("row label index out of range"),
                };
                view! {
                    <ZoneMarker label=label side="left"  col=13 row=row viewport_h=viewport_h.into() />
                    <ZoneMarker label=label side="right" col=29 row=row viewport_h=viewport_h.into() />
                }
            }).collect::<Vec<_>>()}

            // Column labels A..I, each with a top + bottom marker,
            // anchored at row 6 (bottom edge) and row 14 (top edge).
            {(0..9).map(|i| {
                let col = 13 + 2 * i;
                let label: &'static str = match i {
                    0 => "A", 1 => "B", 2 => "C", 3 => "D", 4 => "E",
                    5 => "F", 6 => "G", 7 => "H", 8 => "I",
                    _ => unreachable!("column label index out of range"),
                };
                view! {
                    <ZoneMarker label=label side="bottom" col=col row=6  viewport_h=viewport_h.into() />
                    <ZoneMarker label=label side="top"    col=col row=14 viewport_h=viewport_h.into() />
                }
            }).collect::<Vec<_>>()}
        </figure>
    }
}

/// One straight line connecting two opposite marker anchors across the
/// drawing surface. Rendered as a 1px-wide fixed-position element with a
/// plain div background, so it survives page scroll and resize like the
/// markers themselves.
///
/// `orientation` is "horizontal" (left-right) or "vertical" (top-bottom).
/// - horizontal: `at` is the row coordinate; `from` and `to` are the two
///   column coordinates the line spans between.
/// - vertical:   `at` is the column coordinate; `from` and `to` are the two
///   row coordinates the line spans between.
#[component]
fn AxisConnector(
    orientation: &'static str,
    at: i32,
    from: i32,
    to: i32,
    viewport_h: Signal<i32>,
) -> impl IntoView {
    let style = move || {
        let vh = viewport_h.get();
        if vh <= 0 {
            return "display: none;".to_string();
        }
        match orientation {
            "horizontal" => {
                let top = row_to_top_px(at, vh);
                let left = col_to_left_px(from.min(to));
                let width = (to - from).abs() * GRID_MAJOR;
                format!(
                    "position: fixed; left: {left}px; top: {top}px; width: {width}px; height: 0;",
                )
            }
            "vertical" => {
                let left = col_to_left_px(at);
                let top_from = row_to_top_px(from.max(to), vh);
                let height = (to - from).abs() * GRID_MAJOR;
                format!(
                    "position: fixed; left: {left}px; top: {top_from}px; width: 0; height: {height}px;",
                )
            }
            _ => "display: none;".to_string(),
        }
    };

    view! {
        <div
            class=format!("axis-connector axis-connector-{orientation}")
            style=style
            aria-hidden="true"
        />
    }
}

/// One marker balloon pinned to a specific page-grid intersection. The
/// marker circle hangs outside the drawing area; the leader line ends at an
/// anchor dot that sits exactly on the requested (col, row) intersection,
/// with origin bottom-left.
///
/// `side` controls which way the balloon floats from the anchor:
/// - \"left\"  — anchor on the right edge of the SVG, balloon extends leftward
/// - \"right\" — anchor on the left edge of the SVG, balloon extends rightward
/// - \"top\"   — anchor on the bottom edge, balloon extends upward
/// - \"bottom\" — anchor on the top edge, balloon extends downward
#[component]
fn ZoneMarker(
    label: &'static str,
    /// One of "left", "right", "top", "bottom".
    side: &'static str,
    /// Page-grid column index (0 = leftmost major vertical line).
    col: i32,
    /// Page-grid row index (0 = bottom-most major horizontal line).
    row: i32,
    /// Current viewport height in px, used to resolve the bottom-origin row.
    viewport_h: Signal<i32>,
) -> impl IntoView {
    // viewBox is 64x32 for horizontal leaders, 32x64 for vertical. The
    // anchor dot sits at one end, the leader crosses the body, the balloon
    // ring sits at the other end, and the label glyph is centered in the
    // ring.
    let (view_box, css_w, css_h, anchor_cx, anchor_cy, ring_cx, ring_cy, leader_path): (
        &'static str,
        i32,
        i32,
        i32,
        i32,
        i32,
        i32,
        &'static str,
    ) = match side {
        "left" => ("0 0 64 32", 64, 32, 62, 16, 16, 16, "M 62 16 L 27 16"),
        "right" => ("0 0 64 32", 64, 32, 2, 16, 48, 16, "M 2 16 L 37 16"),
        "top" => ("0 0 32 64", 32, 64, 16, 62, 16, 16, "M 16 62 L 16 27"),
        "bottom" => ("0 0 32 64", 32, 64, 16, 2, 16, 48, "M 16 2 L 16 37"),
        _ => ("0 0 64 32", 64, 32, 62, 16, 16, 16, ""),
    };

    // Inline styles position the SVG so the *anchor dot* lands on the
    // requested grid intersection. The dot is rendered at (anchor_cx,
    // anchor_cy) in SVG-space, so the SVG's top-left must sit at
    // `target - anchor`.
    let style = move || {
        let vh = viewport_h.get();
        if vh <= 0 {
            // Viewport height unknown yet; keep the marker hidden until
            // resize reports it.
            return "display: none;".to_string();
        }
        let target_left = col_to_left_px(col);
        let target_top = row_to_top_px(row, vh);
        format!(
            "position: fixed; left: {}px; top: {}px; width: {}px; height: {}px;",
            target_left - anchor_cx,
            target_top - anchor_cy,
            css_w,
            css_h,
        )
    };

    view! {
        <svg
            class=format!("zone-marker zone-marker-{side}")
            style=style
            viewBox=view_box
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
                    <path
                        d=leader_path
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                    <circle
                        cx=anchor_cx cy=anchor_cy r="2"
                        fill="currentColor"
                        stroke="none"
                    />
                    <circle
                        cx=ring_cx cy=ring_cy r="11"
                        fill="var(--color-base-100)"
                        stroke="currentColor"
                        stroke-width="1"
                    />
                    <circle
                        cx=ring_cx cy=ring_cy r="8.5"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="0.6"
                    />
                    <text
                        x=ring_cx y=ring_cy
                        text-anchor="middle"
                        dominant-baseline="central"
                        class="zone-marker-text"
                        fill="currentColor"
                        stroke="none"
                    >
                        {label}
                    </text>
        </svg>
    }
}
