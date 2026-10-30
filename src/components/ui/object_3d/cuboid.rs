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

    /// Extract the width component.
    #[must_use]
    pub fn width(&self) -> f64 {
        self.width
    }

    /// Extract the depth component.
    #[must_use]
    pub fn depth(&self) -> f64 {
        self.depth
    }

    /// Extract the height component.
    #[must_use]
    pub fn height(&self) -> f64 {
        self.height
    }

    /// Decompose into (width, depth, height).
    #[must_use]
    pub fn components(&self) -> (f64, f64, f64) {
        (self.width, self.depth, self.height)
    }
}
