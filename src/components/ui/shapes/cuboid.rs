use crate::components::ui::shapes::dimensions::Dimensions;
use crate::components::ui::shapes::{Point3d, RenderedGeometry, project, quad};

/// A rectangular cuboid with explicit dimensions in all three axes.
#[derive(Clone, Copy)]
pub struct Cuboid {
    /// Size along the X axis (screen right-down in projection).
    pub width: f64,
    /// Size along the Y axis (screen down-left to up-right on top face).
    pub depth: f64,
    /// Size along the Z axis (screen up).
    pub height: f64,
}

impl Cuboid {
    /// Create a cube where width, depth, and height share the same size.
    #[must_use]
    pub const fn cube(size: f64) -> Self {
        Self {
            width: size,
            depth: size,
            height: size,
        }
    }
}

impl Dimensions for Cuboid {
    fn width(&self) -> f64 {
        self.width
    }

    fn depth(&self) -> f64 {
        self.depth
    }

    fn height(&self) -> f64 {
        self.height
    }
}

impl Cuboid {
    /// Render this cuboid into isometric screen-space geometry.
    pub fn render(&self) -> RenderedGeometry {
        let (hw, hd, hh) = {
            let (width, depth, height) = self.components();
            (width / 2.0, depth / 2.0, height / 2.0)
        };

        let back_top = project(Point3d::new(-hw, -hd, hh));
        let right_top = project(Point3d::new(hw, -hd, hh));
        let left_top = project(Point3d::new(-hw, hd, hh));
        let front_top = project(Point3d::new(hw, hd, hh));
        let back_bottom = project(Point3d::new(-hw, -hd, -hh));
        let right_bottom = project(Point3d::new(hw, -hd, -hh));
        let left_bottom = project(Point3d::new(-hw, hd, -hh));
        let front_bottom = project(Point3d::new(hw, hd, -hh));

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
}
