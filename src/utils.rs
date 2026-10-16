/// URL of the GitHub commit endpoint used when the title block links a
/// deployed build back to its source revision.
pub const GITHUB_REPO_URL: &str = "https://github.com/XodiumSoftware/xodium.org/commit";

/// Read the current device pixel ratio and format it as a drafting-style
/// scale pair. 1.0 (100% zoom) reads as "1:1"; anything else reads "1:N.NN"
/// so the value matches engineering drawing conventions.
#[must_use]
pub fn read_scale() -> String {
    leptos::web_sys::window().map_or_else(
        || "1:1".to_string(),
        |w| {
            let ratio = w.device_pixel_ratio();
            if (ratio - 1.0).abs() < f64::EPSILON {
                "1:1".to_string()
            } else {
                format!("1:{ratio:.2}")
            }
        },
    )
}
