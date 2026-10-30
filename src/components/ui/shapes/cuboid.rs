use crate::components::ui::shapes::dimensions::Dimensions;
use crate::components::ui::shapes::{Point3d, RenderedGeometry, project, quad};

/// A rectangular cuboid with explicit dimensions in all three axes.
#[derive(Clone, Copy)]
#[must_use]
pub struct Cuboid {
    /// Extent along the lattice X axis.
    pub width: f64,
    /// Extent along the lattice Y axis.
    pub depth: f64,
    /// Extent along the lattice Z axis.
    pub height: f64,
}

impl Cuboid {
    /// Convenience constructor for a cube where all axes share one size.
    pub const fn cube(size: f64) -> Self {
        Self {
            width: size,
            depth: size,
            height: size,
        }
    }

    /// Render the cuboid into isometric screen-space geometry.
    pub fn render(&self) -> RenderedGeometry {
        let (hw, hd, hh) = (self.width / 2.0, self.depth / 2.0, self.height / 2.0);

        let front_bottom = Point3d::new(-hw, -hd, -hh);
        let front_top = Point3d::new(-hw, -hd, hh);
        let left_bottom = Point3d::new(hw, -hd, -hh);
        let left_top = Point3d::new(hw, -hd, hh);
        let back_bottom = Point3d::new(hw, hd, -hh);
        let back_top = Point3d::new(hw, hd, hh);
        let right_bottom = Point3d::new(-hw, hd, -hh);
        let right_top = Point3d::new(-hw, hd, hh);

        let front_bottom_s = project(front_bottom);
        let front_top_s = project(front_top);
        let left_bottom_s = project(left_bottom);
        let left_top_s = project(left_top);
        let back_bottom_s = project(back_bottom);
        let back_top_s = project(back_top);
        let right_bottom_s = project(right_bottom);
        let right_top_s = project(right_top);

        let top_face = quad(back_top_s, left_top_s, front_top_s, right_top_s);
        let left_face = quad(left_top_s, left_bottom_s, front_bottom_s, front_top_s);
        let right_face = quad(right_top_s, right_bottom_s, left_bottom_s, left_top_s);

        RenderedGeometry {
            top_face,
            left_face,
            right_face,
            edges: Vec::new(),
            hidden: vec![
                (front_bottom_s, back_bottom_s),
                (front_bottom_s, right_bottom_s),
                (front_bottom_s, front_top_s),
            ],
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
