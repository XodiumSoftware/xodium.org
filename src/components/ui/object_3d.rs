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

/// A 3D lattice point used during shape construction.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Point3d {
    /// Lattice X coordinate.
    pub x: f64,
    /// Lattice Y coordinate.
    pub y: f64,
    /// Lattice Z coordinate.
    pub z: f64,
}

impl Point3d {
    /// Convenience constructor for a lattice point.
    #[must_use]
    pub const fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }
}

/// A 2D screen-space point returned by the isometric projection.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct Point2d {
    /// Horizontal screen coordinate.
    pub x: f64,
    /// Vertical screen coordinate.
    pub y: f64,
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
    pub edges: Vec<(Point2d, Point2d)>,
    /// Hidden/dashed edges.
    pub hidden: Vec<(Point2d, Point2d)>,
}

pub(crate) fn project(point: Point3d) -> Point2d {
    const COS30: f64 = 0.866_025_403_784_438_6;
    const SIN30: f64 = 0.5;
    Point2d {
        x: (point.x - point.y) * COS30,
        y: (point.x + point.y) * SIN30 - point.z,
    }
}

pub(crate) fn fmt_pt(out: &mut String, p: Point2d) {
    write!(out, "{:.2},{:.2}", p.x, p.y).expect("writing to a String is infallible");
}

pub(crate) fn quad(a: Point2d, b: Point2d, c: Point2d, d: Point2d) -> String {
    let mut out = String::new();
    fmt_pt(&mut out, a);
    out.push(' ');
    fmt_pt(&mut out, b);
    out.push(' ');
    fmt_pt(&mut out, c);
    out.push(' ');
    fmt_pt(&mut out, d);
    out
}

pub(crate) fn tri(a: Point2d, b: Point2d, c: Point2d) -> String {
    let mut out = String::new();
    fmt_pt(&mut out, a);
    out.push(' ');
    fmt_pt(&mut out, b);
    out.push(' ');
    fmt_pt(&mut out, c);
    out
}

fn render_geometry(shape: Shape) -> RenderedGeometry {
    match shape {
        Shape::Cuboid(ref c) => c.render(),
        Shape::Cube(size) => Cuboid::cube(size).render(),
        Shape::Pyramid(ref p) => p.render(),
        Shape::TriangularPrism(ref t) => t.render(),
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

/// Render a list of screen-space edges as SVG lines inside a group.
fn render_edge_lines(edges: &[(Point2d, Point2d)], class: &'static str) -> impl IntoView + use<> {
    view! {
        <g class=class>
            {edges
                .iter()
                .map(|(p1, p2)| view! {
                    <line
                        x1=format!("{:.2}", p1.x)
                        y1=format!("{:.2}", p1.y)
                        x2=format!("{:.2}", p2.x)
                        y2=format!("{:.2}", p2.y)
                    />
                })
                .collect::<Vec<_>>()}
        </g>
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
    let Point2d {
        x: screen_x,
        y: screen_y,
    } = project(Point3d::new(x, y, z));

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
                {render_edge_lines(&edges, "iso-edges")}
                {render_edge_lines(&hidden, "iso-hidden")}
            </svg>
        </div>
    }
}
