/// Browser geometry (`inner_width`, `client_x`) arrives as an f64 that's
/// always a non-negative integer value well within i32 range. Saturating
/// via `trunc` avoids the `clippy::cast_possible_truncation` lint while
/// keeping one code path for adapting JS pixel values into Rust integers.
#[must_use]
pub fn to_i32_saturated(value: f64) -> Option<i32> {
    if value.is_finite() && value >= f64::from(i32::MIN) && value <= f64::from(i32::MAX) {
        #[allow(clippy::cast_possible_truncation)]
        Some(value.trunc() as i32)
    } else {
        None
    }
}
