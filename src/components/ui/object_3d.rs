use core::fmt::Write as _;
use leptos::prelude::*;

/// Dimensions for an object. Can be specified explicitly or using a
/// convenience shape constructor.
#[derive(Clone, Copy)]
pub enum Dimensions {
    /// A rectangular cuboid with explicit dimensions in all three axes.
    Cuboid {
        /// Size along the X axis (screen right-down in projection).
        width: f64,
        /// Size along the Y axis (screen down-left to up-right on top face).
        depth: f64,
        /// Size along the Z axis (screen up).
        height: f64,
    },
    /// Convenience constructor: applies one value to width, depth, and height.
    /// Useful for cubes and as a foundation for future shape types.
    Cube(f64),
    /// Square pyramid: `base_size` applies to width and depth (base),
    /// `height` is the height from base to apex.
    Pyramid {
        /// Base size (width and depth are equal for pyramids).
        base_size: f64,
        /// Height from base to apex (Z axis).
        height: f64,
    },
    /// Triangular prism: a tube with a triangular cross-section.
    /// Extruded along the Z axis (vertical).
    TriangularPrism {
        /// Size of the triangular base (equilateral).
        base_size: f64,
        /// Length of the tube (extrusion distance).
        length: f64,
        /// When true, flips the triangle on the X/Y axes.
        flip: bool,
    },
}

impl Dimensions {
    /// Extract the width component.
    #[must_use]
    pub fn width(&self) -> f64 {
        match self {
            Self::Cuboid { width, .. } => *width,
            Self::Cube(size) => *size,
            Self::Pyramid { base_size, .. } | Self::TriangularPrism { base_size, .. } => *base_size,
        }
    }

    /// Extract the depth component.
    #[must_use]
    pub fn depth(&self) -> f64 {
        match self {
            Self::Cuboid { depth, .. } => *depth,
            Self::Cube(size) => *size,
            Self::Pyramid { base_size, .. } | Self::TriangularPrism { base_size, .. } => *base_size,
        }
    }

    /// Extract the height component.
    #[must_use]
    pub fn height(&self) -> f64 {
        match self {
            Self::Cuboid { height, .. } | Self::Pyramid { height, .. } => *height,
            Self::Cube(size) => *size,
            Self::TriangularPrism { length, .. } => *length,
        }
    }

    /// Decompose into (width, depth, height).
    #[must_use]
    pub fn components(&self) -> (f64, f64, f64) {
        match self {
            Self::Cuboid {
                width,
                depth,
                height,
            } => (*width, *depth, *height),
            Self::Cube(size) => (*size, *size, *size),
            Self::Pyramid { base_size, height } => (*base_size, *base_size, *height),
            Self::TriangularPrism {
                base_size, length, ..
            } => (*base_size, *base_size, *length),
        }
    }
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

/// A corner of an object, used for precise positioning.
#[derive(Clone, Copy)]
pub enum Corner {
    /// Corner at (-X, -Y, -Z): back-bottom-left
    BackLeftBottom,
    /// Corner at (+X, -Y, -Z): back-bottom-right
    BackRightBottom,
    /// Corner at (-X, +Y, -Z): back-top-left
    BackLeftTop,
    /// Corner at (+X, +Y, -Z): back-top-right
    BackRightTop,
    /// Corner at (-X, -Y, +Z): front-bottom-left
    FrontLeftBottom,
    /// Corner at (+X, -Y, +Z): front-bottom-right
    FrontRightBottom,
    /// Corner at (-X, +Y, +Z): front-top-left
    FrontLeftTop,
    /// Corner at (+X, +Y, +Z): front-top-right
    FrontRightTop,
}

/// Attachment to another block. Can attach to a face for flush placement,
/// or to a corner for precise point positioning.
#[derive(Clone, Copy)]
pub enum Attachment {
    /// Attach to a face. The new block's opposite face is brought flush
    /// against the target's face on the same axis: attaching to `Face::Top`
    /// stacks the new block on top; to `Face::Right` places it to the right
    /// of the target, and so on.
    Face {
        /// Id of the sibling block to attach to.
        target: &'static str,
        /// Which face of the target to attach against.
        face: Face,
    },
    /// Attach to a corner point with precise positioning. The new block's
    /// center is placed at the specified corner of the target block.
    Corner {
        /// Id of the sibling block to attach to.
        target: &'static str,
        /// Which corner of the target to position at.
        corner: Corner,
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
    /// Unique identifier used for placement references and registry lookups.
    pub id: &'static str,
    /// Display name shown in the tooltip on hover / when pinned.
    pub name: &'static str,
    /// Bounding-box size of the object.
    pub size: Dimensions,
    /// Attachment to another block. `None` means this is a root block
    /// whose position is determined by the scene's centering logic.
    pub attached_to: Option<Attachment>,
    /// Position resolved by the scene after attachments and centering.
    #[doc(hidden)]
    pub resolved_position: Option<Position>,
    /// Depth index for z-ordering. Set by the scene based on isometric projection.
    /// Higher values are further back (should be rendered with lower z-index).
    #[doc(hidden)]
    pub depth_index: Option<i32>,
    /// Optional per-face colour overrides. `None` uses the blueprint theme
    /// defaults (primary / secondary / accent). `Some(FaceColors { .. })`
    /// replaces all three faces at once.
    pub colors: Option<FaceColors>,
    /// When true the object is drawn as a draft reference: faces are
    /// unfilled and all edges use dashed strokes so the block reads as
    /// proposed/work-in-progress geometry rather than committed structure.
    pub is_draft: bool,
    /// URL to open when the object is clicked. `None` means no action.
    pub url: Option<&'static str>,
}

impl Default for Object3dProperties {
    fn default() -> Self {
        Self {
            id: "default",
            name: "Unnamed Object",
            size: Dimensions::Cube(100.0),
            attached_to: None,
            resolved_position: None,
            depth_index: None,
            colors: None,
            is_draft: false,
            url: None,
        }
    }
}

/// A single isometric wireframe object. Renders just the SVG and its
/// interactive target wrapper; pan and zoom are applied by the enclosing
/// `Object3dScene`, so multiple objects move as one scene.
///
/// Clicking the object opens its `url` if one is configured; otherwise the
/// click is a no-op. Keyboard-accessible via Enter or Space. A click that
/// follows a drag is suppressed via [`SceneContext::last_drag_end`] so
/// releasing the mouse after panning does not trigger navigation.
///
/// With [`Object3dProperties::is_draft`] set the object is rendered in the
/// draft style used for uncommitted geometry: no face fills, every edge
/// dashed (not just the hidden ones).
#[component]
#[must_use]
pub fn Object3d(props: Object3dProperties) -> impl IntoView {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;

    let Object3dProperties {
        size,
        name,
        attached_to: _,
        colors,
        is_draft,
        url,
        depth_index,
        ..
    } = props;

    let (width, depth, height) = size.components();
    let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

    let project = move |x: f64, y: f64, z: f64| ((x - y) * COS30, (x + y) * SIN30 - z);

    let Position { x, y, z } = props
        .resolved_position
        .expect("resolved_position must be set by Object3dScene");
    let (screen_x, screen_y) = project(x, y, z);

    let fmt_pt = |p: (f64, f64)| format!("{:.2},{:.2}", p.0, p.1);

    let (top_face, left_face, right_face, edges, hidden) = match size {
        Dimensions::Cuboid { .. } | Dimensions::Cube(_) => {
            let back_top = project(-hw, -hd, hh);
            let right_top = project(hw, -hd, hh);
            let left_top = project(-hw, hd, hh);
            let front_top = project(hw, hd, hh);
            let back_bottom = project(-hw, -hd, -hh);
            let right_bottom = project(hw, -hd, -hh);
            let left_bottom = project(-hw, hd, -hh);
            let front_bottom = project(hw, hd, -hh);

            let quad = |a: (f64, f64), b: (f64, f64), c: (f64, f64), d: (f64, f64)| {
                format!("{} {} {} {}", fmt_pt(a), fmt_pt(b), fmt_pt(c), fmt_pt(d))
            };

            let top_face = quad(back_top, right_top, front_top, left_top);
            let left_face = quad(left_top, front_top, front_bottom, left_bottom);
            let right_face = quad(front_top, right_top, right_bottom, front_bottom);

            let edges = vec![];

            let hidden = vec![
                (back_top, back_bottom),
                (back_bottom, left_bottom),
                (back_bottom, right_bottom),
            ];

            (top_face, left_face, right_face, edges, hidden)
        }
        Dimensions::Pyramid {
            base_size,
            height: _,
        } => {
            let hb = base_size / 2.0;
            let apex = project(0.0, 0.0, hh);

            let back_base = project(-hb, -hb, -hh);
            let right_base = project(hb, -hb, -hh);
            let left_base = project(-hb, hb, -hh);
            let front_base = project(hb, hb, -hh);

            let quad = |a: (f64, f64), b: (f64, f64), c: (f64, f64), d: (f64, f64)| {
                format!("{} {} {} {}", fmt_pt(a), fmt_pt(b), fmt_pt(c), fmt_pt(d))
            };
            let tri = |a: (f64, f64), b: (f64, f64), c: (f64, f64)| {
                format!("{} {} {}", fmt_pt(a), fmt_pt(b), fmt_pt(c))
            };

            let base = quad(back_base, right_base, front_base, left_base);
            let left_face = tri(left_base, front_base, apex);
            let right_face = tri(front_base, right_base, apex);

            let edges = vec![
                (left_base, apex),
                (right_base, apex),
                (front_base, apex),
                (left_base, front_base),
                (front_base, right_base),
            ];

            let hidden = vec![
                (back_base, apex),
                (back_base, left_base),
                (back_base, right_base),
            ];

            (base, left_face, right_face, edges, hidden)
        }
        Dimensions::TriangularPrism {
            base_size,
            length,
            flip,
        } => {
            let hb = base_size / 2.0;
            let hl = length / 2.0;

            let triangle_points = if flip {
                [(0.0, hb, 0.0), (-hb, -hb, 0.0), (hb, -hb, 0.0)]
            } else {
                [(0.0, -hb, 0.0), (-hb, hb, 0.0), (hb, hb, 0.0)]
            };

            let p1_bottom = project(triangle_points[0].0, triangle_points[0].1, -hl);
            let p2_bottom = project(triangle_points[1].0, triangle_points[1].1, -hl);
            let p3_bottom = project(triangle_points[2].0, triangle_points[2].1, -hl);

            let p1_top = project(triangle_points[0].0, triangle_points[0].1, hl);
            let p2_top = project(triangle_points[1].0, triangle_points[1].1, hl);
            let p3_top = project(triangle_points[2].0, triangle_points[2].1, hl);

            let tri_bottom = format!(
                "{} {} {}",
                fmt_pt(p1_bottom),
                fmt_pt(p2_bottom),
                fmt_pt(p3_bottom)
            );
            let _tri_top = format!("{} {} {}", fmt_pt(p1_top), fmt_pt(p2_top), fmt_pt(p3_top));

            let bottom_face = format!(
                "{} {} {} {}",
                fmt_pt(p1_bottom),
                fmt_pt(p2_bottom),
                fmt_pt(p2_top),
                fmt_pt(p1_top)
            );

            let side_face = format!(
                "{} {} {} {}",
                fmt_pt(p2_bottom),
                fmt_pt(p3_bottom),
                fmt_pt(p3_top),
                fmt_pt(p2_top)
            );

            let edges = vec![
                (p1_bottom, p1_top),
                (p2_bottom, p2_top),
                (p3_bottom, p3_top),
                (p1_bottom, p2_bottom),
                (p1_bottom, p3_bottom),
                (p1_top, p2_top),
                (p1_top, p3_top),
            ];

            let hidden = vec![(p2_bottom, p3_bottom), (p2_top, p3_top)];

            (bottom_face, tri_bottom, side_face, edges, hidden)
        }
    };

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
        write!(face_overrides, "--face-top: {top};").expect("writing to a String is infallible");
        write!(face_overrides, "--face-left: {left};").expect("writing to a String is infallible");
        write!(face_overrides, "--face-right: {right};")
            .expect("writing to a String is infallible");
    }

    let navigate = move || {
        if let (Some(url), Some(window)) = (url, web_sys::window()) {
            let _ =
                window.open_with_url_and_target_and_features(url, "_blank", "noopener,noreferrer");
        }
    };

    let z_index = depth_index.map(|d| format!("z-index: {};", 1000 - d));
    let style_str = format!(
        "left: calc(50% + {screen_x:.2}px); top: calc(50% + {screen_y:.2}px); {} {}",
        face_overrides,
        z_index.unwrap_or_default()
    );

    view! {
        <div
            class="object-3d-target tooltip tooltip-top"
            class:object-3d-draft=is_draft
            role="button"
            aria-label=name
            tabindex="0"
            data-tip=tooltip
            style=style_str
            on:click=move |_| navigate()
            on:keydown=move |ev| {
                if ev.key() == "Enter" || ev.key() == " " {
                    ev.prevent_default();
                    navigate();
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
                    {edges
                        .iter()
                        .map(|(p1, p2)| view! {
                            <line
                                x1=format!("{:.2}", p1.0)
                                y1=format!("{:.2}", p1.1)
                                x2=format!("{:.2}", p2.0)
                                y2=format!("{:.2}", p2.1)
                            />
                        })
                        .collect::<Vec<_>>()}
                </g>
                <g class="iso-hidden">
                    {hidden
                        .iter()
                        .map(|(p1, p2)| view! {
                            <line
                                x1=format!("{:.2}", p1.0)
                                y1=format!("{:.2}", p1.1)
                                x2=format!("{:.2}", p2.0)
                                y2=format!("{:.2}", p2.1)
                            />
                        })
                        .collect::<Vec<_>>()}
                </g>
            </svg>
        </div>
    }
}
