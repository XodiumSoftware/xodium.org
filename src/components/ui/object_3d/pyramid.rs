use crate::components::ui::object_3d::dimensions::Dimensions;
use crate::components::ui::object_3d::{Point3d, RenderedGeometry, project, quad, tri};

/// A square pyramid: the base is a square in the X/Y plane and the apex
/// rises along the Z axis.
#[derive(Clone, Copy)]
pub struct Pyramid {
    /// Base size (width and depth are equal for pyramids).
    pub base_size: f64,
    /// Height from base to apex (Z axis).
    pub height: f64,
}

impl Dimensions for Pyramid {
    fn width(&self) -> f64 {
        self.base_size
    }

    fn depth(&self) -> f64 {
        self.base_size
    }

    fn height(&self) -> f64 {
        self.height
    }
}

impl Pyramid {
    /// Render this pyramid into isometric screen-space geometry.
    #[must_use]
    pub fn render(&self) -> RenderedGeometry {
        let (width, _depth, height) = self.components();
        let hb = width / 2.0;
        let hh = height / 2.0;
        let apex = project(Point3d::new(0.0, 0.0, hh));

        let back_base = project(Point3d::new(-hb, -hb, -hh));
        let right_base = project(Point3d::new(hb, -hb, -hh));
        let left_base = project(Point3d::new(-hb, hb, -hh));
        let front_base = project(Point3d::new(hb, hb, -hh));

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
}
