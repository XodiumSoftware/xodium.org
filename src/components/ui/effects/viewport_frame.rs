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
/// drawing surface. Rendered as a minimal SVG with a single line so the
/// connector rasterises exactly like the marker leaders (same stroke color,
/// same 1px linewidth), instead of using a div border which sits 0.5px off
/// the stroke center because HTML borders paint on the inside edge of the
/// box while SVG strokes paint centered on the path.
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
    let data = move || {
        let vh = viewport_h.get();
        if vh <= 0 {
            return None;
        }
        match orientation {
            "horizontal" => {
                let y = row_to_top_px(at, vh);
                let x1 = col_to_left_px(from.min(to));
                let x2 = col_to_left_px(from.max(to));
                Some((x1, y, x2, y))
            }
            "vertical" => {
                let x = col_to_left_px(at);
                // from.max(to) is the *upper* row (higher row index = higher
                // on screen = smaller top pixel), which is the line's start.
                let y1 = row_to_top_px(from.max(to), vh);
                let y2 = row_to_top_px(from.min(to), vh);
                Some((x, y1, x, y2))
            }
            _ => None,
        }
    };

    view! {
        {move || data().map(|(x1, y1, x2, y2)| {
            let min_x = x1.min(x2);
            let min_y = y1.min(y2);
            let width = (x2 - x1).abs();
            let height = (y2 - y1).abs();
            // SVG needs a non-zero bounding box even for a straight line;
            // give the line a 1px canvas so it sits centered on the
            // computed coordinate instead of clipping to nothing. The line
            // itself runs along the canvas's 0.5 centerline so the SVG
            // stroke (which is centered on the path) lands at the same
            // pixel band as the marker leaders.
            let (svg_width, svg_height, lx1, ly1, lx2, ly2) = if width == 0 {
                (1, height, 0.5, 0.0, 0.5, f64::from(height))
            } else {
                (width, 1, 0.0, 0.5, f64::from(width), 0.5)
            };
            view! {
                <svg
                    class="axis-connector"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width=svg_width
                    height=svg_height
                    viewBox=format!("0 0 {svg_width} {svg_height}")
                    preserveAspectRatio="none"
                    style=format!("position: fixed; left: {min_x}px; top: {min_y}px;")
                >
                    <line
                        x1=lx1 y1=ly1 x2=lx2 y2=ly2
                        stroke="var(--color-base-content)"
                        stroke-width="1"
                    />
                </svg>
            }
        })}
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
