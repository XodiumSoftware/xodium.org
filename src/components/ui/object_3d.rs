use crate::components::ui::object_3d::cuboid::Cuboid;
use crate::components::ui::object_3d::pyramid::Pyramid;
use crate::components::ui::object_3d::triangular_prism::TriangularPrism;
use core::fmt::Write as _;
use leptos::prelude::*;

pub mod cuboid;
pub mod pyramid;
pub mod triangular_prism;

/// A shape that can be rendered inside the isometric scene.
#[derive(Clone, Copy)]
pub enum Shape {
    /// A rectangular cuboid with explicit dimensions in all three axes.
    Cuboid(Cuboid),
    /// Convenience constructor: applies one value to width, depth, and height.
    Cube(f64),
    /// Square pyramid: a square base with an apex above it.
    Pyramid(Pyramid),
    /// Triangular prism: an equilateral triangle extruded along the Z axis.
    TriangularPrism(TriangularPrism),
}

impl Shape {
    /// Extract the width component for attachment and scene bounds.
    #[must_use]
    pub fn width(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.width(),
            Self::Cube(size) => *size,
            Self::Pyramid(p) => p.width(),
            Self::TriangularPrism(t) => t.width(),
        }
    }

    /// Extract the depth component for attachment and scene bounds.
    #[must_use]
    pub fn depth(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.depth(),
            Self::Cube(size) => *size,
            Self::Pyramid(p) => p.depth(),
            Self::TriangularPrism(t) => t.depth(),
        }
    }

    /// Extract the height component for attachment and scene bounds.
    #[must_use]
    pub fn height(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.height(),
            Self::Cube(size) => *size,
            Self::Pyramid(p) => p.height(),
            Self::TriangularPrism(t) => t.height(),
        }
    }

    /// Decompose into (width, depth, height).
    #[must_use]
    pub fn components(&self) -> (f64, f64, f64) {
        match self {
            Self::Cuboid(c) => c.components(),
            Self::Cube(size) => (*size, *size, *size),
            Self::Pyramid(p) => p.components(),
            Self::TriangularPrism(t) => t.components(),
        }
    }
}

impl Default for Shape {
    fn default() -> Self {
        Self::Cube(100.0)
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

/// Attachment to another object in the scene.
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
    /// Shape to render and size in the isometric projection.
    pub shape: Shape,
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
            shape: Shape::default(),
            attached_to: None,
            resolved_position: None,
            depth_index: None,
            colors: None,
            is_draft: false,
            url: None,
        }
    }
}

/// Rendered geometry returned by a shape renderer. The three faces are SVG
/// polygon `points` strings; visible edges and hidden edges are lists of
/// screen-space line endpoints.
pub struct RenderedGeometry {
    /// Polygon points for the top/primary face.
    pub top_face: String,
    /// Polygon points for the left face.
    pub left_face: String,
    /// Polygon points for the right face.
    pub right_face: String,
    /// Visible edges.
    pub edges: Vec<((f64, f64), (f64, f64))>,
    /// Hidden/dashed edges.
    pub hidden: Vec<((f64, f64), (f64, f64))>,
}

fn project(x: f64, y: f64, z: f64) -> (f64, f64) {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;
    ((x - y) * COS30, (x + y) * SIN30 - z)
}

fn fmt_pt(p: (f64, f64)) -> String {
    format!("{:.2},{:.2}", p.0, p.1)
}

fn quad(a: (f64, f64), b: (f64, f64), c: (f64, f64), d: (f64, f64)) -> String {
    format!("{} {} {} {}", fmt_pt(a), fmt_pt(b), fmt_pt(c), fmt_pt(d))
}

fn tri(a: (f64, f64), b: (f64, f64), c: (f64, f64)) -> String {
    format!("{} {} {}", fmt_pt(a), fmt_pt(b), fmt_pt(c))
}

/// Render a cuboid into isometric screen-space geometry.
#[must_use]
pub fn render_cuboid(cuboid: &Cuboid) -> RenderedGeometry {
    let (width, depth, height) = cuboid.components();
    let (hw, hd, hh) = (width / 2.0, depth / 2.0, height / 2.0);

    let back_top = project(-hw, -hd, hh);
    let right_top = project(hw, -hd, hh);
    let left_top = project(-hw, hd, hh);
    let front_top = project(hw, hd, hh);
    let back_bottom = project(-hw, -hd, -hh);
    let right_bottom = project(hw, -hd, -hh);
    let left_bottom = project(-hw, hd, -hh);
    let front_bottom = project(hw, hd, -hh);

    let top_face = quad(back_top, right_top, front_top, left_top);
    let left_face = quad(left_top, front_top, front_bottom, left_bottom);
    let right_face = quad(front_top, right_top, right_bottom, front_bottom);

    let edges = vec![];

    let hidden = vec![
        (back_top, back_bottom),
        (back_bottom, left_bottom),
        (back_bottom, right_bottom),
    ];

    RenderedGeometry {
        top_face,
        left_face,
        right_face,
        edges,
        hidden,
    }
}

/// Render a pyramid into isometric screen-space geometry.
#[must_use]
pub fn render_pyramid(pyramid: &Pyramid) -> RenderedGeometry {
    let (width, _depth, height) = pyramid.components();
    let hb = width / 2.0;
    let hh = height / 2.0;
    let apex = project(0.0, 0.0, hh);

    let back_base = project(-hb, -hb, -hh);
    let right_base = project(hb, -hb, -hh);
    let left_base = project(-hb, hb, -hh);
    let front_base = project(hb, hb, -hh);

    let top_face = quad(back_base, right_base, front_base, left_base);
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

    RenderedGeometry {
        top_face,
        left_face,
        right_face,
        edges,
        hidden,
    }
}

/// Render a triangular prism into isometric screen-space geometry.
#[must_use]
pub fn render_triangular_prism(prism: &TriangularPrism) -> RenderedGeometry {
    let (width, _depth, height) = prism.components();
    let hb = width / 2.0;
    let hl = height / 2.0;

    let triangle_points = if prism.flip {
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

    let _tri_bottom = tri(p1_bottom, p2_bottom, p3_bottom);

    let top_face = quad(p1_bottom, p2_bottom, p2_top, p1_top);
    let left_face = tri(p2_bottom, p3_bottom, p3_top);
    let right_face = quad(p2_bottom, p3_bottom, p3_top, p2_top);

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

    RenderedGeometry {
        top_face,
        left_face,
        right_face,
        edges,
        hidden,
    }
}

fn render_geometry(shape: Shape) -> RenderedGeometry {
    match shape {
        Shape::Cuboid(ref c) => render_cuboid(c),
        Shape::Cube(size) => render_cuboid(&Cuboid::cube(size)),
        Shape::Pyramid(ref p) => render_pyramid(p),
        Shape::TriangularPrism(ref t) => render_triangular_prism(t),
    }
}

fn build_face_overrides(colors: Option<FaceColors>) -> String {
    let mut face_overrides = String::new();
    if let Some(FaceColors { top, left, right }) = colors {
        write!(face_overrides, "--face-top: {top};").expect("writing to a String is infallible");
        write!(face_overrides, "--face-left: {left};").expect("writing to a String is infallible");
        write!(face_overrides, "--face-right: {right};")
            .expect("writing to a String is infallible");
    }
    face_overrides
}

fn build_style(
    screen_x: f64,
    screen_y: f64,
    depth_index: Option<i32>,
    face_overrides: &str,
) -> String {
    let z_index = depth_index.map(|d| format!("z-index: {};", 1000 - d));
    format!(
        "left: calc(50% + {screen_x:.2}px); top: calc(50% + {screen_y:.2}px); {} {}",
        face_overrides,
        z_index.unwrap_or_default()
    )
}

fn build_view_box(hw: f64, hd: f64, hh: f64) -> (String, f64) {
    let extent_x = f64::midpoint(hw, hd) * 0.866_025_403_784_438_6 * 2.0;
    let extent_y = f64::midpoint(hw, hd) + hh;
    let max_extent = extent_x.max(extent_y) + 8.0;
    let view_box = format!(
        "{:.2} {:.2} {:.2} {:.2}",
        -max_extent,
        -max_extent,
        max_extent * 2.0,
        max_extent * 2.0
    );
    (view_box, max_extent * 2.0)
}

fn make_navigate(url: Option<&'static str>) -> impl Fn() + Copy {
    move || {
        if let (Some(url), Some(window)) = (url, web_sys::window()) {
            let _ =
                window.open_with_url_and_target_and_features(url, "_blank", "noopener,noreferrer");
        }
    }
}

/// A single isometric wireframe object. Renders just the SVG and its
/// interactive target wrapper; pan and zoom are applied by the enclosing
/// `Object3dScene`, so multiple objects move as one scene.
///
/// Clicking the object opens its `url` if one is configured; otherwise the
/// click is a no-op. Keyboard-accessible via Enter or Space.
///
/// With [`Object3dProperties::is_draft`] set the object is rendered in the
/// draft style used for uncommitted geometry: no face fills, every edge
/// dashed (not just the hidden ones).
#[component]
#[must_use]
pub fn Object3d(props: Object3dProperties) -> impl IntoView {
    let Object3dProperties {
        shape,
        name,
        attached_to: _,
        colors,
        is_draft,
        url,
        depth_index,
        ..
    } = props;

    let (hw, hd, hh) = {
        let (width, depth, height) = shape.components();
        (width / 2.0, depth / 2.0, height / 2.0)
    };

    let Position { x, y, z } = props
        .resolved_position
        .expect("resolved_position must be set by Object3dScene");
    let (screen_x, screen_y) = project(x, y, z);

    let RenderedGeometry {
        top_face,
        left_face,
        right_face,
        edges,
        hidden,
    } = render_geometry(shape);

    let (view_box, svg_pixel_size) = build_view_box(hw, hd, hh);
    let face_overrides = build_face_overrides(colors);
    let style_str = build_style(screen_x, screen_y, depth_index, &face_overrides);
    let navigate = make_navigate(url);
    let tooltip = name.to_string();

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
