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

impl TriangularPrism {
    /// Extract the width component (same as `base_size`).
    #[must_use]
    pub fn width(&self) -> f64 {
        self.base_size
    }

    /// Extract the depth component (same as `base_size`).
    #[must_use]
    pub fn depth(&self) -> f64 {
        self.base_size
    }

    /// Extract the height component (same as `length`).
    #[must_use]
    pub fn height(&self) -> f64 {
        self.length
    }

    /// Decompose into (width, depth, height).
    #[must_use]
    pub fn components(&self) -> (f64, f64, f64) {
        (self.base_size, self.base_size, self.length)
    }
}
