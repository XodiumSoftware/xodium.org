use crate::utils::clean_sha;
use leptos::prelude::*;

const GIT_SHA: &str = env!("GIT_SHA");
const GITHUB_REPO_URL: &str = "https://github.com/XodiumSoftware/xodium.org/commit";

/// Blueprint title block — the rectangular metadata frame found in the bottom
/// right corner of engineering drawings (sheet number, title, drawn-by, date,
/// current revision).
///
/// The revision cell links to the commit that produced the current build so a
/// visitor can trace a deployed sheet back to its source, exactly like the
/// "REV" letter on a controlled drawing.
///
/// Rendered as a real `<table>` so screen readers announce it as tabular
/// metadata rather than as page content.
#[component]
#[must_use]
pub fn TitleBlock() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();
    let commit_url = if GIT_SHA == "unknown" {
        None
    } else {
        Some(format!("{GITHUB_REPO_URL}/{}", clean_sha(GIT_SHA)))
    };
    let rev_label = if GIT_SHA == "unknown" {
        "A".to_string()
    } else {
        clean_sha(GIT_SHA).to_string()
    };

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
                        <span class="title-block-value">"01 / 01"</span>
                    </td>
                    <td class="title-block-cell">
                        <span class="title-block-label">"SCALE"</span>
                        <span class="title-block-value">"NTS"</span>
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
                                    class="title-block-rev"
                                    aria-label="View commit for this build on GitHub"
                                >
                                    <span class="title-block-value">{rev_label}</span>
                                </a>
                            }.into_any(),
                            None => view! {
                                <span class="title-block-value">{rev_label}</span>
                            }.into_any(),
                        }}
                    </td>
                </tr>
            </tbody>
        </table>
    }
}
