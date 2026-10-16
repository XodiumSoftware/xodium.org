use leptos::prelude::*;

/// Blueprint title block — the rectangular metadata frame found in the corner
/// of engineering drawings (sheet number, title, drawn-by, date, revision).
///
/// Rendered as a real `<table>` so screen readers announce it as tabular
/// metadata rather than as page content.
#[component]
#[must_use]
pub fn TitleBlock() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();

    view! {
        <table
            aria-label="Site metadata"
            class="title-block font-mono text-[10px] leading-tight text-base-content/80"
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
                        <span class="title-block-value">"A"</span>
                    </td>
                </tr>
            </tbody>
        </table>
    }
}
