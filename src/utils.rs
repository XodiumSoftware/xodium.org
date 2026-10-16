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

/// Check whether the user has requested reduced motion.
///
/// Defaults to `false` if the media query cannot be evaluated.
#[must_use]
pub fn prefers_reduced_motion() -> bool {
    leptos::web_sys::window()
        .and_then(|w| w.match_media("(prefers-reduced-motion: reduce)").ok())
        .flatten()
        .is_some_and(|mql| mql.matches())
}

/// Apply a `reduced-motion` class to the document element when the user
/// prefers reduced motion.
///
/// This lets CSS and JS share a single, consistent signal in addition to the
/// standard `prefers-reduced-motion` media query.
pub fn apply_reduced_motion_class() {
    if !prefers_reduced_motion() {
        return;
    }
    let Some(document) = leptos::web_sys::window().and_then(|w| w.document()) else {
        return;
    };
    if let Some(html) = document.document_element() {
        let _ = html.class_list().add_1("reduced-motion");
    }
}
