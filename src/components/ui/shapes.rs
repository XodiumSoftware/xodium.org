use crate::components::ui::shapes::cuboid::Cuboid;
use crate::components::ui::shapes::dimensions::Dimensions;
use core::fmt::Write as _;
use leptos::prelude::*;
use std::rc::Rc;

/// Rectangular cuboid / cube shape.
pub mod cuboid;
/// Shared spatial-extent trait for isometric shapes.
pub mod dimensions;

/// A shape that can be rendered inside the isometric scene.
#[derive(Clone, Copy)]
pub enum Shape {
    /// A rectangular cuboid with explicit dimensions in all three axes.
    Cuboid(Cuboid),
    /// Convenience constructor: applies one value to width, depth, and height.
    Cube(f64),
}

impl Shape {
    /// Render this shape into isometric screen-space geometry.
    pub fn render(&self) -> RenderedGeometry {
        match self {
            Self::Cuboid(c) => c.render(),
            Self::Cube(size) => Cuboid::cube(*size).render(),
        }
    }

    /// Extract the width component for attachment and scene bounds.
    #[must_use]
    pub fn width(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.width(),
            Self::Cube(size) => *size,
        }
    }

    /// Extract the depth component for attachment and scene bounds.
    #[must_use]
    pub fn depth(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.depth(),
            Self::Cube(size) => *size,
        }
    }

    /// Extract the height component for attachment and scene bounds.
    #[must_use]
    pub fn height(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.height(),
            Self::Cube(size) => *size,
        }
    }

    /// Decompose into (width, depth, height).
    #[must_use]
    pub fn components(&self) -> (f64, f64, f64) {
        match self {
            Self::Cuboid(c) => c.components(),
            Self::Cube(size) => (*size, *size, *size),
        }
    }
}

impl Default for Shape {
    fn default() -> Self {
        Self::Cube(100.0)
    }
}

impl Dimensions for Shape {
    fn width(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.width(),
            Self::Cube(size) => *size,
        }
    }

    fn depth(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.depth(),
            Self::Cube(size) => *size,
        }
    }

    fn height(&self) -> f64 {
        match self {
            Self::Cuboid(c) => c.height(),
            Self::Cube(size) => *size,
        }
    }
}

/// Lattice position of an object's centre after scene layout.
#[derive(Clone, Copy)]
#[must_use]
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

/// Per-face CSS colour overrides used by [`Object3d`].
#[derive(Clone, Copy)]
#[must_use]
pub struct FaceColors {
    /// CSS colour for the top face.
    pub top: &'static str,
    /// CSS colour for the left face.
    pub left: &'static str,
    /// CSS colour for the right face.
    pub right: &'static str,
}

/// Configuration for a single [`Object3d`] instance.
///
/// Most callers only need to set `id`, `name`, `shape`, and optional
/// `attached_to`, `colors`, `url`, or `on_click`. The `resolved_position`
/// `resolved_position` and `depth_index` fields are populated automatically by [`ThreeDScene`]
/// and should not be set manually.
#[derive(Clone)]
#[must_use]
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
    /// Optional callback invoked when the object is activated by click or
    /// keyboard. If present this overrides `url` and keeps the user inside the
    /// app instead of navigating away.
    pub on_click: Option<Rc<dyn Fn() + 'static>>,
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
            on_click: None,
        }
    }
}

/// A 3D lattice point used during shape construction.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
#[must_use]
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
    pub const fn new(x: f64, y: f64, z: f64) -> Self {
        Self { x, y, z }
    }
}

/// A 2D screen-space point returned by the isometric projection.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
#[must_use]
pub struct Point2d {
    /// Horizontal screen coordinate.
    pub x: f64,
    /// Vertical screen coordinate.
    pub y: f64,
}

/// Rendered geometry returned by a shape renderer. The three faces are SVG
/// polygon `points` strings; visible edges and hidden edges are lists of
/// screen-space line endpoints.
#[derive(Clone)]
#[must_use]
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

fn make_handler(
    url: Option<&'static str>,
    on_click: Option<Rc<dyn Fn() + 'static>>,
) -> impl Fn() + Clone {
    move || {
        if let Some(on_click) = on_click.clone() {
            on_click.as_ref()();
        } else if let (Some(url), Some(window)) = (url, web_sys::window())
            && let Err(error) =
                window.open_with_url_and_target_and_features(url, "_blank", "noopener,noreferrer")
        {
            web_sys::console::warn_1(
                &format!("Failed to open {url} from object click: {error:?}").into(),
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_project_origin() {
        let origin = project(Point3d::new(0.0, 0.0, 0.0));
        assert!((origin.x - 0.0).abs() < f64::EPSILON);
        assert!((origin.y - 0.0).abs() < f64::EPSILON);
    }

    #[wasm_bindgen_test]
    fn test_dimensions_trait_for_shapes() {
        let cuboid = Cuboid {
            width: 10.0,
            depth: 20.0,
            height: 30.0,
        };
        assert_eq!(cuboid.components(), (10.0, 20.0, 30.0));

        let cube = Cuboid::cube(15.0);
        assert_eq!(cube.components(), (15.0, 15.0, 15.0));
    }

    #[wasm_bindgen_test]
    fn test_shape_enum_dimensions() {
        assert_eq!(Shape::Cube(10.0).components(), (10.0, 10.0, 10.0));
        assert_eq!(
            Shape::Cuboid(Cuboid {
                width: 1.0,
                depth: 2.0,
                height: 3.0,
            })
            .components(),
            (1.0, 2.0, 3.0)
        );
    }

    #[wasm_bindgen_test]
    fn test_shape_render_produces_faces_and_edges() {
        let geometry = Shape::Cube(10.0).render();

        assert_ne!(geometry.top_face, "");
        assert_ne!(geometry.left_face, "");
        assert_ne!(geometry.right_face, "");
        // A cube has no visible silhouette edges in this renderer; hidden edges
        // carry the back-corner geometry.
        assert_eq!(geometry.edges, []);
        assert_eq!(geometry.hidden.len(), 3);
    }

    #[wasm_bindgen_test]
    fn test_build_style_without_depth_index() {
        let style = build_style(10.5, -20.25, None, "");
        assert!(style.contains("left: calc(50% + 10.50px)"));
        assert!(style.contains("top: calc(50% + -20.25px)"));
        assert!(!style.contains("z-index"));
    }

    #[wasm_bindgen_test]
    fn test_build_style_with_depth_index() {
        let style = build_style(0.0, 0.0, Some(5), "");
        assert!(style.contains("z-index: 995;"));
    }

    #[wasm_bindgen_test]
    fn test_build_face_overrides() {
        let overrides = build_face_overrides(Some(FaceColors {
            top: "#a",
            left: "#b",
            right: "#c",
        }));
        assert!(overrides.contains("--face-top: #a;"));
        assert!(overrides.contains("--face-left: #b;"));
        assert!(overrides.contains("--face-right: #c;"));
    }

    #[wasm_bindgen_test]
    fn test_build_face_overrides_none_is_empty() {
        assert_eq!(build_face_overrides(None), "");
    }

    #[wasm_bindgen_test]
    fn test_default_properties_has_no_callback() {
        let props = Object3dProperties::default();
        assert!(props.on_click.is_none());
        assert!(props.url.is_none());
    }

    #[wasm_bindgen_test]
    fn test_handler_invokes_callback_when_provided() {
        let called = Rc::new(core::cell::Cell::new(false));
        let called_clone = Rc::clone(&called);
        let callback: Option<Rc<dyn Fn()>> = Some(Rc::new(move || called_clone.set(true)));

        let handler = make_handler(None, callback);
        handler();

        assert!(called.get());
    }

    #[wasm_bindgen_test]
    fn test_fmt_pt_and_quad_helpers() {
        let mut out = String::new();
        fmt_pt(&mut out, Point2d { x: 1.0, y: 2.0 });
        assert_eq!(out, "1.00,2.00");

        let quad_points = quad(
            Point2d { x: 0.0, y: 0.0 },
            Point2d { x: 1.0, y: 0.0 },
            Point2d { x: 1.0, y: 1.0 },
            Point2d { x: 0.0, y: 1.0 },
        );
        assert_eq!(quad_points, "0.00,0.00 1.00,0.00 1.00,1.00 0.00,1.00");
    }
}
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
/// `ThreeDScene`, so multiple objects move as one scene.
///
/// Clicking the object opens its `url` if one is configured; otherwise the
/// click is a no-op. Keyboard-accessible via Enter or Space.
///
/// With [`Object3dProperties::is_draft`] set the object is rendered in the
/// draft style used for uncommitted geometry: no face fills, every edge
/// dashed (not just the hidden ones).
#[component]
#[must_use]
pub fn Object3d(
    /// Configuration for this object: shape, placement, colours, URL, etc.
    props: Object3dProperties,
) -> impl IntoView {
    let Object3dProperties {
        shape,
        name,
        attached_to: _,
        colors,
        is_draft,
        url,
        on_click,
        depth_index,
        ..
    } = props;

    let (hw, hd, hh) = {
        let (width, depth, height) = shape.components();
        (width / 2.0, depth / 2.0, height / 2.0)
    };

    let Position { x, y, z } = props
        .resolved_position
        .expect("resolved_position must be set by ThreeDScene");
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
    } = shape.render();

    let (view_box, svg_pixel_size) = build_view_box(hw, hd, hh);
    let face_overrides = build_face_overrides(colors);
    let style_str = build_style(screen_x, screen_y, depth_index, &face_overrides);
    let navigate = make_handler(url, on_click);
    let key_navigate = navigate.clone();
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
                    key_navigate();
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
