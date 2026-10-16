use leptos::prelude::*;

use crate::utils::{GITHUB_REPO_URL, read_scale};

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
/// The SCALE cell shows the live device pixel ratio as a drafting-style
/// scale pair: 1:1 at 100% zoom, 1:1.25 at 125%, and so on. The value is
/// re-read on window resize so the cell tracks the browser zoom control
/// without requiring a page reload.
///
/// Rendered as a real `<table>` so screen readers announce it as tabular
/// metadata rather than as page content.
#[component]
#[must_use]
pub fn TitleBlock() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();
    let git_sha = option_env!("GIT_SHA");
    let commit_url = git_sha.map(|sha| format!("{GITHUB_REPO_URL}/{sha}"));

    let (scale, set_scale) = signal(read_scale());

    Effect::new(move |_| {
        use leptos::wasm_bindgen::JsCast;
        use leptos::wasm_bindgen::closure::Closure;
        use leptos::web_sys;

        let Some(window) = web_sys::window() else {
            return;
        };
        let closure = Closure::wrap(Box::new(move || {
            set_scale.set(read_scale());
        }) as Box<dyn FnMut()>);
        let _ = window.add_event_listener_with_callback("resize", closure.as_ref().unchecked_ref());
        closure.forget();
    });

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
