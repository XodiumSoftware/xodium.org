use leptos::prelude::*;

const GITHUB_REPO_URL: &str = "https://github.com/XodiumSoftware/xodium.org/commit";

/// Blueprint title block — the rectangular metadata frame found in the bottom
/// right corner of engineering drawings (sheet number, title, drawn-by, date,
/// current revision).
///
/// The revision cell links to the commit that produced the current build so a
/// visitor can trace a deployed sheet back to its source, exactly like the
/// "REV" letter on a controlled drawing. The commit SHA is read from the
/// `GIT_SHA` environment variable set by the CI workflow; local builds leave
/// it unset and the cell renders as "N.A." with no link.
///
/// Rendered as a real `<table>` so screen readers announce it as tabular
/// metadata rather than as page content.
#[component]
#[must_use]
pub fn TitleBlock() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();
    let git_sha = option_env!("GIT_SHA");
    let commit_url = git_sha.map(|sha| format!("{GITHUB_REPO_URL}/{sha}"));

    let scale = leptos::web_sys::window().map_or_else(
        || "1:1".to_string(),
        |w| {
            let ratio = w.device_pixel_ratio();
            if (ratio - 1.0).abs() < f64::EPSILON {
                "1:1".to_string()
            } else {
                format!("1:{ratio:.2}")
            }
        },
    );

    view! {
        <table
            aria-label="Site metadata"
            class="font-mono text-xs leading-snug text-base-content"
        >
            <tbody>
                <tr>
                    <td class="title-block-cell title-block-cell-wide" colspan="2">
                        <span class="title-block-label">"XODIUM SOFTWARE"</span>
                        <span class="title-block-value">"OPEN-SOURCE CAD"</span>
                    </td>
                    <td class="title-block-cell">
                        <span class="title-block-label">"SHEET"</span>
                        <span class="title-block-value">"01/01"</span>
                    </td>
                    <td class="title-block-cell">
                        <span class="title-block-label">"SCALE"</span>
                        <span class="title-block-value">{scale}</span>
                    </td>
                </tr>
                <tr>
                    <td class="title-block-cell">
                        <span class="title-block-label">"DRAWN"</span>
                        <span class="title-block-value">"XODIUM"</span>
                    </td>
                    <td class="title-block-cell">
                        <span class="title-block-label">"CHECKED"</span>
                        <span class="title-block-value">"OSS"</span>
                    </td>
                    <td class="title-block-cell">
                        <span class="title-block-label">"DATE"</span>
                        <span class="title-block-value">{current_year.to_string()}</span>
                    </td>
                    <td class="title-block-cell">
                        <span class="title-block-label">"REV"</span>
                        {match commit_url {
                            Some(url) => view! {
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="title-block-value link link-hover link-primary"
                                >
                                    {git_sha.unwrap_or("")}
                                </a>
                            }.into_any(),
                            None => view! {
                                <span class="title-block-value">"N.A."</span>
                            }.into_any(),
                        }}
                    </td>
                </tr>
            </tbody>
        </table>
    }
}
