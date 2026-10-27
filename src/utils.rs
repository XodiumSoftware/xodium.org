/// URL of the GitHub commit endpoint used when the title block links a
/// deployed build back to its source revision.
pub const GITHUB_REPO_URL: &str = "https://github.com/XodiumSoftware/xodium.org/commit";

/// URL of the Cadiotheka project, rendered as a navigable 3D block and opened
/// by the `Alt + 1` keyboard shortcut.
pub const CADIOTHEKA_URL: &str = "https://cadiotheka.com/";

/// Read the current device pixel ratio and format it as a drafting-style
/// ratio pair. 1.0 reads as "1:1"; anything else reads "1:N.NN". This is
/// *not* browser zoom — it's the physical-to-CSS pixel ratio reported by
/// the display/OS, surfaced in the title block under the "DPR" label so the
/// two aren't conflated.
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
