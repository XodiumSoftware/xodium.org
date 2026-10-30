use crate::components::ui::object_3d::dimensions::Dimensions;
use crate::components::ui::object_3d::{Point3d, RenderedGeometry, project, quad};

/// A triangular prism: a tube with an equilateral triangular cross-section
/// extruded along the Z axis (vertical).
#[derive(Clone, Copy)]
pub struct TriangularPrism {
    /// Size of the triangular base (equilateral).
    pub base_size: f64,
    /// Length of the tube (extrusion distance).
    pub length: f64,
    /// When true, flips the triangle on the X/Y axes.
    pub flip: bool,
}

impl Dimensions for TriangularPrism {
    fn width(&self) -> f64 {
        self.base_size
    }

    fn depth(&self) -> f64 {
        self.base_size
    }

    fn height(&self) -> f64 {
        self.length
    }
}

impl TriangularPrism {
    /// Render this triangular prism into isometric screen-space geometry.
    pub fn render(&self) -> RenderedGeometry {
        let (width, _depth, height) = self.components();
        let hb = width / 2.0;
        let hl = height / 2.0;

        let triangle_points = if self.flip {
            [
                Point3d::new(0.0, hb, 0.0),
                Point3d::new(-hb, -hb, 0.0),
                Point3d::new(hb, -hb, 0.0),
            ]
        } else {
            [
                Point3d::new(0.0, -hb, 0.0),
                Point3d::new(-hb, hb, 0.0),
                Point3d::new(hb, hb, 0.0),
            ]
        };

        let p1_bottom = project(Point3d::new(
            triangle_points[0].x,
            triangle_points[0].y,
            -hl,
        ));
        let p2_bottom = project(Point3d::new(
            triangle_points[1].x,
            triangle_points[1].y,
            -hl,
        ));
        let p3_bottom = project(Point3d::new(
            triangle_points[2].x,
            triangle_points[2].y,
            -hl,
        ));

        let p1_top = project(Point3d::new(triangle_points[0].x, triangle_points[0].y, hl));
        let p2_top = project(Point3d::new(triangle_points[1].x, triangle_points[1].y, hl));
        let p3_top = project(Point3d::new(triangle_points[2].x, triangle_points[2].y, hl));

        let top_face = quad(p1_bottom, p2_bottom, p2_top, p1_top);
        let left_face = quad(p2_bottom, p3_bottom, p3_top, p2_top);
        let right_face = quad(p3_bottom, p1_bottom, p1_top, p3_top);

        let edges = vec![
            (p1_bottom, p1_top),
            (p2_bottom, p2_top),
            (p3_bottom, p3_top),
            (p1_top, p2_top),
            (p2_top, p3_top),
            (p3_top, p1_top),
        ];

        let hidden = vec![
            (p1_bottom, p2_bottom),
            (p2_bottom, p3_bottom),
            (p3_bottom, p1_bottom),
        ];

        RenderedGeometry {
            top_face,
            left_face,
            right_face,
            edges,
            hidden,
        }
    }
}
