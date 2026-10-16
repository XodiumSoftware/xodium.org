use crate::contexts::scene::{DRAG_CLICK_SUPPRESS_MS, SceneContext};
use core::fmt::Write as _;
use leptos::prelude::*;

#[derive(Clone, Copy)]
pub struct Dimensions {
    /// Size along the X axis (screen right-down in projection).
    pub width: f64,
    /// Size along the Y axis (screen left-down in projection).
    pub depth: f64,
    /// Size along the Z axis (screen up).
    pub height: f64,
}

#[derive(Clone, Copy)]
pub struct Position {
    /// Lattice X coordinate of the object's centre, in drawing units.
    pub x: f64,
    /// Lattice Y coordinate (screen back-left to front-right on top face).
    pub y: f64,
    /// Lattice Z coordinate (vertical, positive is up).
    pub z: f64,
}

/// A cardinal face of an object, used to describe attachments.
#[derive(Clone, Copy)]
pub enum Face {
    /// The +Z face (top). Attaching to the top places the new block above.
    Top,
    /// The -Z face (bottom).
    Bottom,
    /// The -X face (screen back-left).
    Left,
    /// The +X face (screen front-right).
    Right,
    /// The -Y face (screen front-left).
    Front,
    /// The +Y face (screen back-right).
    Back,
}

/// How a block is placed inside a scene.
#[derive(Clone, Copy)]
pub enum Placement {
    /// Place at an explicit lattice coordinate. No attachment is computed.
    At(Position),
    /// Attach to another block's face. The new block's opposite face is
    /// brought flush against the target's face on the same axis: attaching
    /// to `Face::Top` stacks the new block on top; to `Face::Right` places
    /// it to the right of the target, and so on. `target` is the `name` of
    /// a sibling block that must appear earlier in the scene's child list.
    AttachedTo {
        /// Name of the sibling block to attach to.
        target: &'static str,
        /// Which face of the target to attach against.
        face: Face,
    },
}

#[derive(Clone, Copy)]
pub struct FaceColors {
    /// CSS colour for the top face.
    pub top: &'static str,
    /// CSS colour for the left face.
    pub left: &'static str,
    /// CSS colour for the right face.
    pub right: &'static str,
}

#[derive(Clone, Copy)]
pub struct Object3dProperties {
    /// Display name shown in the tooltip on hover / when pinned.
    pub name: &'static str,
    /// Bounding-box size of the object.
    pub size: Dimensions,
    /// How the object is placed on the lattice.
    pub placement: Placement,
    /// Optional per-face colour overrides. `None` uses the blueprint theme
    /// defaults (primary / secondary / accent). `Some(FaceColors { .. })`
    /// replaces all three faces at once.
    pub colors: Option<FaceColors>,
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
        size: Dimensions {
            width,
            depth,
            height,
        },
        name,
        placement,
        colors,
        is_draft,
    } = props;
    let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

    let project = move |x: f64, y: f64, z: f64| ((x - y) * COS30, (x + y) * SIN30 - z);

    let (screen_x, screen_y) = match placement {
        Placement::At(Position { x, y, z }) => project(x, y, z),
        Placement::AttachedTo { .. } => {
            panic!("AttachedTo placements are resolved by Object3dScene before render")
        }
    };

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

    let mut face_overrides = String::new();
    if let Some(FaceColors { top, left, right }) = colors {
        let _ = write!(face_overrides, "--face-top: {top};");
        let _ = write!(face_overrides, "--face-left: {left};");
        let _ = write!(face_overrides, "--face-right: {right};");
    }

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
            style=format!(
                "left: calc(50% + {screen_x:.2}px); top: calc(50% + {screen_y:.2}px); {face_overrides}"
            )
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
