use leptos::prelude::*;
use wasm_bindgen::JsCast;

const DBLCLICK_WINDOW_MS: f64 = 400.0;
const DRAG_CLICK_SUPPRESS_MS: f64 = 100.0;

/// Shared pan/zoom signals and drag-suppression timestamp, provided by
/// [`BuildingBlocksScene`] and consumed by each nested [`BuildingBlock`].
#[derive(Clone, Copy)]
struct SceneContext {
    last_drag_end: ReadSignal<f64>,
}

#[derive(Clone, Copy)]
pub struct BuildingBlockProperties {
    /// Width along the X axis (screen right-down in projection).
    pub width: f64,
    /// Depth along the Y axis (screen left-down in projection).
    pub depth: f64,
    /// Height along the Z axis (screen up).
    pub height: f64,
    /// Display name shown in the tooltip on hover / when pinned.
    pub name: &'static str,
    /// Horizontal offset from the scene's centre, in pixels at 1x zoom.
    pub offset_x: f64,
    /// Vertical offset from the scene's centre, in pixels at 1x zoom.
    pub offset_y: f64,
}

/// A single isometric wireframe block. Renders just the SVG and its
/// interactive target wrapper; pan and zoom are applied by the enclosing
/// `BuildingBlocksScene`, so multiple blocks move as one scene.
///
/// Clicking the block toggles its own pinned "selected" state via DaisyUI's
/// `tooltip-open` class; the block stays lifted and its tooltip stays visible
/// until clicked again. Keyboard-accessible via Enter or Space. A click that
/// follows a drag is suppressed via [`SceneContext::last_drag_end`] so
/// releasing the mouse after panning does not also toggle the pin.
#[component]
#[must_use]
pub fn BuildingBlock(props: BuildingBlockProperties) -> impl IntoView {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;

    let (selected, set_selected) = signal(false);
    let scene = use_context::<SceneContext>();

    let BuildingBlockProperties {
        width,
        depth,
        height,
        name,
        offset_x,
        offset_y,
    } = props;
    let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

    let project = move |x: f64, y: f64, z: f64| ((x - y) * COS30, (x + y) * SIN30 - z);

    let back_top = project(-hw, -hd, hh);
    let right_top = project(hw, -hd, hh);
    let left_top = project(-hw, hd, hh);
    let front_top = project(hw, hd, hh);
    let back_bottom = project(-hw, -hd, -hh);
    let right_bottom = project(hw, -hd, -hh);
    let left_bottom = project(-hw, hd, -hh);
    let front_bottom = project(hw, hd, -hh);

    let fmt_pt = |p: (f64, f64)| format!("{:.2},{:.2}", p.0, p.1);
    let quad = |a: (f64, f64), b: (f64, f64), c: (f64, f64), d: (f64, f64)| {
        format!("{} {} {} {}", fmt_pt(a), fmt_pt(b), fmt_pt(c), fmt_pt(d))
    };

    let top_face = quad(back_top, right_top, front_top, left_top);
    let left_face = quad(left_top, front_top, front_bottom, left_bottom);
    let right_face = quad(front_top, right_top, right_bottom, front_bottom);

    let extent_x = (hw + hd) * COS30;
    let extent_y = (hw + hd) * SIN30 + hh;
    let max_extent = extent_x.max(extent_y) + 8.0;
    let view_box = format!(
        "{:.2} {:.2} {:.2} {:.2}",
        -max_extent,
        -max_extent,
        max_extent * 2.0,
        max_extent * 2.0
    );

    let tooltip = name.to_string();

    view! {
        <div
            class="building-block-target tooltip tooltip-top"
            class:tooltip-open=selected
            role="button"
            aria-label=name
            aria-pressed=move || selected.get().to_string()
            tabindex="0"
            data-tip=tooltip
            style=format!("left: calc(50% + {offset_x:.2}px); top: calc(50% + {offset_y:.2}px);")
            on:click=move |_| {
                let suppress = scene.is_some_and(|s| {
                    js_sys::Date::now() - s.last_drag_end.get() < DRAG_CLICK_SUPPRESS_MS
                });
                if !suppress {
                    set_selected.update(|s| *s = !*s);
                }
            }
            on:keydown=move |ev| {
                if ev.key() == "Enter" || ev.key() == " " {
                    ev.prevent_default();
                    set_selected.update(|s| *s = !*s);
                }
            }
        >
            <svg
                class="building-block-iso"
                viewBox=view_box
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
            >
                <g class="iso-face iso-top">
                    <polygon points=top_face />
                </g>
                <g class="iso-face iso-left">
                    <polygon points=left_face />
                </g>
                <g class="iso-face iso-right">
                    <polygon points=right_face />
                </g>
                <g class="iso-edges">
                    <line
                        x1=format!("{:.2}", left_top.0)
                        y1=format!("{:.2}", left_top.1)
                        x2=format!("{:.2}", left_bottom.0)
                        y2=format!("{:.2}", left_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", right_top.0)
                        y1=format!("{:.2}", right_top.1)
                        x2=format!("{:.2}", right_bottom.0)
                        y2=format!("{:.2}", right_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", front_top.0)
                        y1=format!("{:.2}", front_top.1)
                        x2=format!("{:.2}", front_bottom.0)
                        y2=format!("{:.2}", front_bottom.1)
                    />
                </g>
                <g class="iso-hidden">
                    <line
                        x1=format!("{:.2}", back_top.0)
                        y1=format!("{:.2}", back_top.1)
                        x2=format!("{:.2}", back_bottom.0)
                        y2=format!("{:.2}", back_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", back_bottom.0)
                        y1=format!("{:.2}", back_bottom.1)
                        x2=format!("{:.2}", left_bottom.0)
                        y2=format!("{:.2}", left_bottom.1)
                    />
                    <line
                        x1=format!("{:.2}", back_bottom.0)
                        y1=format!("{:.2}", back_bottom.1)
                        x2=format!("{:.2}", right_bottom.0)
                        y2=format!("{:.2}", right_bottom.1)
                    />
                </g>
            </svg>
        </div>
    }
}

/// Collective viewport that hosts any number of [`BuildingBlock`] children
/// and owns the shared pan/zoom state. Drag with any mouse button pans the
/// whole scene; mouse wheel zooms around the centre; double-tapping the
/// middle button within 400ms resets the view to 1:1 centred (the UI Events
/// spec only fires `dblclick` for the primary button, so the middle-button
/// double-tap is detected by hand). When a drag ends after moving more than
/// 4 pixels, `last_drag_end` is stamped so the click that immediately follows
/// does not also toggle a block's pinned state.
#[component]
#[must_use]
pub fn BuildingBlocksScene(children: Children) -> impl IntoView {
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
            class="building-block-scene"
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
                let on_cube = ev
                    .target()
                    .and_then(|t| t.dyn_into::<leptos::web_sys::Element>().ok())
                    .is_some_and(|el| el.closest(".building-block-target").ok().flatten().is_some());
                let _ = on_cube;
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
                class="building-block-layer"
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
