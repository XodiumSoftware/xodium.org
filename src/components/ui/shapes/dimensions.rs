/// Spatial extents of a 3D shape in the isometric lattice.
///
/// All shapes report their bounding dimensions along the X (width), Y (depth),
/// and Z (height) axes. These values drive scene layout, attachment
/// calculations, and view-box sizing.
pub trait Dimensions {
    /// Size along the X axis.
    #[must_use]
    fn width(&self) -> f64;

    /// Size along the Y axis.
    #[must_use]
    fn depth(&self) -> f64;

    /// Size along the Z axis.
    #[must_use]
    fn height(&self) -> f64;

    /// Decompose into `(width, depth, height)`.
    #[must_use]
    fn components(&self) -> (f64, f64, f64) {
        (self.width(), self.depth(), self.height())
    }
}
