//! Main content section.
//!
//! Hosts the accessible page heading and the content column for the
//! single-page layout.

use leptos::prelude::*;

/// The central content area of the page.
///
/// The column is capped at `max-w-7xl` with `mx-auto`, which is what leaves
/// empty space on both sides once the viewport exceeds that width. The `px-6`
/// gutters are owned here rather than on the frame so narrow viewports shrink
/// the content instead of pressing it against the blueprint border.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    view! {
        <main
            id="main-content"
            tabindex="-1"
            class="flex flex-1 flex-col mx-auto w-full max-w-7xl px-6"
        >
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
        </main>
    }
}
