use crate::contexts::scene::{DRAG_CLICK_SUPPRESS_MS, SceneContext};
use leptos::prelude::*;

#[derive(Clone, Copy)]
pub struct Object3dProperties {
    /// Width along the X axis (screen right-down in projection).
    pub width: f64,
    /// Depth along the Y axis (screen left-down in projection).
    pub depth: f64,
    /// Height along the Z axis (screen up).
    pub height: f64,
    /// Display name shown in the tooltip on hover / when pinned.
    pub name: &'static str,
    /// Lattice X coordinate of the object's centre, in drawing units. The
    /// value lives on the same 3D grid the block's own vertices use, so two
    /// blocks whose `grid_x` differ by `(a.width + b.width) / 2` touch faces
    /// on the X axis. Projected isometrically for the screen position.
    pub grid_x: f64,
    /// Lattice Y coordinate (screen back-left to front-right on the top
    /// face). See `grid_x`.
    pub grid_y: f64,
    /// Lattice Z coordinate (vertical, positive is up). See `grid_x`.
    pub grid_z: f64,
    /// When true the object is drawn as a draft reference: faces are
    /// unfilled and all edges use dashed strokes so the block reads as
    /// proposed/work-in-progress geometry rather than committed structure.
    pub is_draft: bool,
}

/// A single isometric wireframe object. Renders just the SVG and its
/// interactive target wrapper; pan and zoom are applied by the enclosing
/// `Object3dScene`, so multiple objects move as one scene.
///
/// Clicking the object toggles its own pinned "selected" state via DaisyUI's
/// `tooltip-open` class; the object stays lifted and its tooltip stays visible
/// until clicked again. Keyboard-accessible via Enter or Space. A click that
/// follows a drag is suppressed via [`SceneContext::last_drag_end`] so
/// releasing the mouse after panning does not also toggle the pin.
///
/// With [`Object3dProperties::is_draft`] set the object is rendered in the
/// draft style used for uncommitted geometry: no face fills, every edge
/// dashed (not just the hidden ones).
#[component]
#[must_use]
pub fn Object3d(props: Object3dProperties) -> impl IntoView {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;

    let (selected, set_selected) = signal(false);
    let scene = use_context::<SceneContext>();

    let Object3dProperties {
        width,
        depth,
        height,
        name,
        grid_x,
        grid_y,
        grid_z,
        is_draft,
    } = props;
    let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

    let project = move |x: f64, y: f64, z: f64| ((x - y) * COS30, (x + y) * SIN30 - z);

    let (screen_x, screen_y) = project(grid_x, grid_y, grid_z);

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
    let svg_pixel_size = max_extent * 2.0;

    let tooltip = name.to_string();

    view! {
        <div
            class="object-3d-target tooltip tooltip-top"
            class:tooltip-open=selected
            class:object-3d-draft=is_draft
            role="button"
            aria-label=name
            aria-pressed=move || selected.get().to_string()
            tabindex="0"
            data-tip=tooltip
            style=format!("left: calc(50% + {screen_x:.2}px); top: calc(50% + {screen_y:.2}px);")
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
                class="object-3d-iso"
                viewBox=view_box
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
                style=format!("width: {:.2}px; height: {:.2}px;", svg_pixel_size, svg_pixel_size)
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
