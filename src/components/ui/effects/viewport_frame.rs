use leptos::prelude::*;

/// Page-grid geometry constants, mirrored from `public/style.css`:
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
/// Row 0 sits on the bottom-most major gridline of the drawing area; row N
/// sits N major cells above that. In CSS pixels (top-origin):
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

/// Viewport frame — an empty drawing surface carrying the marker balloons
/// and the connector lines between opposite balloons.
///
/// Balloons and connectors are fixed-positioned once mounted; the only
/// moving part is `viewport_h`, which tracks window resize so bottom-origin
/// row coordinates stay pinned to the drawing area's bottom edge.
#[component]
#[must_use]
pub fn ViewportFrame() -> impl IntoView {
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
                .and_then(crate::utils::to_i32_saturated)
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

    let rows: [i32; 5] = [6, 8, 10, 12, 14];
    let cols: [i32; 9] = [13, 15, 17, 19, 21, 23, 25, 27, 29];

    view! {
        <figure class="viewport-frame" aria-label="Drawing frame">
            {rows.iter().map(|row| {
                view! {
                    <AxisConnector
                        orientation="horizontal"
                        at=*row
                        from=13
                        to=29
                        viewport_h=viewport_h.into()
                    />
                }
            }).collect::<Vec<_>>()}

            {cols.iter().map(|col| {
                view! {
                    <AxisConnector
                        orientation="vertical"
                        at=*col
                        from=6
                        to=14
                        viewport_h=viewport_h.into()
                    />
                }
            }).collect::<Vec<_>>()}

            {rows.iter().enumerate().map(|(i, row)| {
                let label: &'static str = match i {
                    0 => "1", 1 => "2", 2 => "3", 3 => "4", 4 => "5",
                    _ => unreachable!("row label index out of range"),
                };
                view! {
                    <ZoneMarker label=label side="left"  at=*row viewport_h=viewport_h.into() />
                    <ZoneMarker label=label side="right" at=*row viewport_h=viewport_h.into() />
                }
            }).collect::<Vec<_>>()}

            {cols.iter().enumerate().map(|(i, col)| {
                let label: &'static str = match i {
                    0 => "A", 1 => "B", 2 => "C", 3 => "D", 4 => "E",
                    5 => "F", 6 => "G", 7 => "H", 8 => "I",
                    _ => unreachable!("column label index out of range"),
                };
                view! {
                    <ZoneMarker label=label side="bottom" at=*col viewport_h=viewport_h.into() />
                    <ZoneMarker label=label side="top"    at=*col viewport_h=viewport_h.into() />
                }
            }).collect::<Vec<_>>()}

        </figure>
    }
}

/// One straight line connecting two opposite marker anchors across the
/// drawing surface.
///
/// `orientation` is "horizontal" or "vertical":
/// - horizontal: `at` is the row coordinate; `from` and `to` are the two
///   column coordinates the line spans between.
/// - vertical:   `at` is the column coordinate; `from` and `to` are the
///   two row coordinates the line spans between.
#[component]
fn AxisConnector(
    orientation: &'static str,
    at: i32,
    from: i32,
    to: i32,
    viewport_h: Signal<i32>,
) -> impl IntoView {
    view! {
        {move || {
            let vh = viewport_h.get();
            if vh <= 0 {
                return None;
            }
            let (x1, y1, x2, y2) = match orientation {
                "horizontal" => {
                    let y = row_to_top_px(at, vh);
                    (col_to_left_px(from), y, col_to_left_px(to), y)
                }
                "vertical" => {
                    let x = col_to_left_px(at);
                    (x, row_to_top_px(from.max(to), vh), x, row_to_top_px(from.min(to), vh))
                }
                _ => return None,
            };
            let min_x = x1.min(x2);
            let min_y = y1.min(y2);
            let width = (x2 - x1).abs();
            let height = (y2 - y1).abs();
            let (svg_width, svg_height, lx1, ly1, lx2, ly2) = if width == 0 {
                (1, height, 0.5, 0.0, 0.5, f64::from(height))
            } else {
                (width, 1, 0.0, 0.5, f64::from(width), 0.5)
            };
            Some(view! {
                <svg
                    class="axis-connector"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width=svg_width
                    height=svg_height
                    viewBox=format!("0 0 {svg_width} {svg_height}")
                    style=format!("position: fixed; left: {min_x}px; top: {min_y}px;")
                    shape-rendering="crispEdges"
                >
                    <line
                        x1=lx1 y1=ly1 x2=lx2 y2=ly2
                        stroke="var(--color-base-content)"
                        stroke-width="1"
                        vector-effect="non-scaling-stroke"
                    />
                </svg>
            })
        }}
    }
}

/// One marker balloon pinned to a fixed page-grid intersection: the leader's
/// anchor dot sits exactly at `at`, with the balloon floating outward toward
/// the page edge chosen by `side`.
///
/// `side` controls which way the balloon floats from the anchor:
/// - "left"  — anchor on the right edge of the SVG; `at` is a row coordinate
/// - "right" — anchor on the left edge of the SVG; `at` is a row coordinate
/// - "top"   — anchor on the bottom edge of the SVG; `at` is a column coordinate
/// - "bottom" — anchor on the top edge of the SVG; `at` is a column coordinate
#[component]
fn ZoneMarker(
    label: &'static str,
    /// One of "left", "right", "top", "bottom".
    side: &'static str,
    /// Page-grid coordinate to pin the anchor to — a row index for
    /// left/right balloons, a column index for top/bottom balloons.
    at: i32,
    /// Current viewport height in px, used to resolve bottom-origin rows.
    viewport_h: Signal<i32>,
) -> impl IntoView {
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

    let style = move || {
        let vh = viewport_h.get();
        if vh <= 0 {
            return "display: none;".to_string();
        }
        let (target_left, target_top) = match side {
            "left" | "right" => {
                let y = row_to_top_px(at, vh);
                let x = if side == "left" {
                    col_to_left_px(13)
                } else {
                    col_to_left_px(29)
                };
                (x, y)
            }
            _ => {
                let x = col_to_left_px(at);
                let y = if side == "top" {
                    row_to_top_px(14, vh)
                } else {
                    row_to_top_px(6, vh)
                };
                (x, y)
            }
        };
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
