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

/// Convert a pixel offset to the nearest major-grid column index, rounding
/// to the nearest line rather than always snapping down.
fn px_to_col(x: i32) -> i32 {
    let rel = x - GRID_INSET;
    (rel + GRID_MAJOR / 2).div_euclid(GRID_MAJOR)
}

/// Convert a pixel offset (top-origin) plus the current viewport height to
/// the nearest bottom-origin row index.
fn px_to_row(y: i32, viewport_h: i32) -> i32 {
    let area_h = viewport_h - 2 * GRID_INSET;
    let visible_rows = area_h / GRID_MAJOR;
    let rel = y - GRID_INSET;
    let row_from_top = (rel + GRID_MAJOR / 2).div_euclid(GRID_MAJOR);
    visible_rows - row_from_top
}

/// Viewport frame — an empty drawing surface carrying the marker balloons
/// and the connector lines between opposite balloons.
///
/// Balloons are draggable: pressing one and moving the pointer snaps its
/// anchor to the nearest page-grid intersection on every move event.
/// Connectors (and the opposite balloon on the shared axis) track the same
/// signal so the whole axis line moves as one continuous drawing element.
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

    let row_signals: [RwSignal<i32>; 5] = [
        RwSignal::new(6),
        RwSignal::new(8),
        RwSignal::new(10),
        RwSignal::new(12),
        RwSignal::new(14),
    ];
    let col_signals: [RwSignal<i32>; 9] = [
        RwSignal::new(13),
        RwSignal::new(15),
        RwSignal::new(17),
        RwSignal::new(19),
        RwSignal::new(21),
        RwSignal::new(23),
        RwSignal::new(25),
        RwSignal::new(27),
        RwSignal::new(29),
    ];

    view! {
        <figure class="viewport-frame" aria-label="Drawing frame">
            {row_signals.iter().map(|axis_row| {
                view! {
                    <AxisConnector
                        orientation="horizontal"
                        axis=*axis_row
                        from=13
                        to=29
                        viewport_h=viewport_h.into()
                    />
                }
            }).collect::<Vec<_>>()}

            {col_signals.iter().map(|axis_col| {
                view! {
                    <AxisConnector
                        orientation="vertical"
                        axis=*axis_col
                        from=6
                        to=14
                        viewport_h=viewport_h.into()
                    />
                }
            }).collect::<Vec<_>>()}

            {row_signals.iter().enumerate().map(|(i, axis_row)| {
                let label: &'static str = match i {
                    0 => "1", 1 => "2", 2 => "3", 3 => "4", 4 => "5",
                    _ => unreachable!("row label index out of range"),
                };
                view! {
                    <ZoneMarker label=label side="left"  axis=*axis_row viewport_h=viewport_h.into() />
                    <ZoneMarker label=label side="right" axis=*axis_row viewport_h=viewport_h.into() />
                }
            }).collect::<Vec<_>>()}

            {col_signals.iter().enumerate().map(|(i, axis_col)| {
                let label: &'static str = match i {
                    0 => "A", 1 => "B", 2 => "C", 3 => "D", 4 => "E",
                    5 => "F", 6 => "G", 7 => "H", 8 => "I",
                    _ => unreachable!("column label index out of range"),
                };
                view! {
                    <ZoneMarker label=label side="bottom" axis=*axis_col viewport_h=viewport_h.into() />
                    <ZoneMarker label=label side="top"    axis=*axis_col viewport_h=viewport_h.into() />
                }
            }).collect::<Vec<_>>()}
        </figure>
    }
}

/// One straight line connecting two opposite marker anchors across the
/// drawing surface.
///
/// `orientation` is "horizontal" or "vertical":
/// - horizontal: `axis` is a row-coordinate signal; `from` and `to` are the
///   two column coordinates the line spans between.
/// - vertical:   `axis` is a column-coordinate signal; `from` and `to` are
///   the two row coordinates the line spans between.
///
/// The line's rendered position tracks its axis signal, so dragging either
/// attached balloon repositions the connector in the same frame.
#[component]
fn AxisConnector(
    orientation: &'static str,
    axis: RwSignal<i32>,
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
                    let y = row_to_top_px(axis.get(), vh);
                    (col_to_left_px(from), y, col_to_left_px(to), y)
                }
                "vertical" => {
                    let x = col_to_left_px(axis.get());
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

/// One marker balloon pinned to an axis signal — its anchor dot tracks the
/// shared coordinate, and dragging it snaps the anchor to the nearest grid
/// intersection along the axis (row-axis markers only change Y, column-axis
/// markers only change X).
///
/// `side` controls which way the balloon floats from the anchor: "left"
/// balloons hang leftward of the anchor, "right" balloons hang rightward,
/// etc. For "left"/"right" the axis is a row coordinate; for "top"/"bottom"
/// the axis is a column coordinate.
#[component]
fn ZoneMarker(
    label: &'static str,
    /// One of "left", "right", "top", "bottom".
    side: &'static str,
    /// Shared axis-coordinate signal — row for left/right, column for
    /// top/bottom. The connected AxisConnector and opposing balloon read
    /// this same signal.
    axis: RwSignal<i32>,
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

    let dragging = RwSignal::new(false);

    let style = move || {
        let vh = viewport_h.get();
        if vh <= 0 {
            return "display: none;".to_string();
        }
        let axis_value = axis.get();
        let (target_left, target_top) = match side {
            "left" | "right" => {
                let y = row_to_top_px(axis_value, vh);
                let x = if side == "left" {
                    col_to_left_px(13)
                } else {
                    col_to_left_px(29)
                };
                (x, y)
            }
            _ => {
                let x = col_to_left_px(axis_value);
                let y = if side == "top" {
                    row_to_top_px(14, vh)
                } else {
                    row_to_top_px(6, vh)
                };
                (x, y)
            }
        };
        format!(
            "position: fixed; left: {}px; top: {}px; width: {}px; height: {}px; cursor: {};",
            target_left - anchor_cx,
            target_top - anchor_cy,
            css_w,
            css_h,
            if dragging.get() { "grabbing" } else { "grab" },
        )
    };

    let on_pointerdown = move |ev: web_sys::PointerEvent| {
        use leptos::wasm_bindgen::JsCast;
        use leptos::wasm_bindgen::closure::Closure;
        use leptos::web_sys;

        let Some(window) = web_sys::window() else {
            return;
        };
        dragging.set(true);

        if let Some(target) = ev
            .target()
            .and_then(|t| t.dyn_into::<web_sys::Element>().ok())
        {
            let _ = target.set_pointer_capture(ev.pointer_id());
        }

        let move_closure = {
            Closure::wrap(Box::new(move |ev: web_sys::PointerEvent| {
                if !dragging.get() {
                    return;
                }
                let x = ev.client_x();
                let y = ev.client_y();
                let vh = viewport_h.get();
                if vh <= 0 {
                    return;
                }
                match side {
                    "left" | "right" => {
                        axis.set(px_to_row(y, vh).clamp(0, 30));
                    }
                    _ => {
                        axis.set(px_to_col(x).clamp(0, 60));
                    }
                }
            }) as Box<dyn FnMut(_)>)
        };

        let move_js = move_closure.as_ref().clone();
        let _ = window.add_event_listener_with_callback("pointermove", move_js.unchecked_ref());
        move_closure.forget();

        let up_closure = Closure::wrap(Box::new(move |_: web_sys::PointerEvent| {
            dragging.set(false);
        }) as Box<dyn FnMut(_)>);
        let up_js = up_closure.as_ref().clone();
        let _ = window.add_event_listener_with_callback("pointerup", up_js.unchecked_ref());
        up_closure.forget();
    };

    view! {
        <svg
            class=format!("zone-marker zone-marker-{side}")
            style=style
            viewBox=view_box
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g on:pointerdown=on_pointerdown class="zone-marker-handle">
                <path
                    d=leader_path
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1"
                    pointer-events="none"
                />
                <circle
                    cx=anchor_cx cy=anchor_cy r="2"
                    fill="currentColor"
                    stroke="none"
                    pointer-events="none"
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
                    pointer-events="none"
                />
                <text
                    x=ring_cx y=ring_cy
                    text-anchor="middle"
                    dominant-baseline="central"
                    class="zone-marker-text"
                    fill="currentColor"
                    stroke="none"
                    pointer-events="none"
                >
                    {label}
                </text>
            </g>
        </svg>
    }
}
