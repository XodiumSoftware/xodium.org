/// A square pyramid: the base is a square in the X/Y plane and the apex
/// rises along the Z axis.
#[derive(Clone, Copy)]
pub struct Pyramid {
    /// Base size (width and depth are equal for pyramids).
    pub base_size: f64,
    /// Height from base to apex (Z axis).
    pub height: f64,
}

impl Pyramid {
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

    /// Extract the height component.
    #[must_use]
    pub fn height(&self) -> f64 {
        self.height
    }

    /// Decompose into (width, depth, height).
    #[must_use]
    pub fn components(&self) -> (f64, f64, f64) {
        (self.base_size, self.base_size, self.height)
    }
}
