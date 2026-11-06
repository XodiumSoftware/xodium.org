//! Main content section.
//!
//! Hosts the accessible page heading and the content column for the
//! single-page layout.

use leptos::prelude::*;

/// The central content area of the page.
///
/// The drawing sheet owns the page width and centring, so this only supplies
/// the inner gutter and fills the remaining height.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col px-6 py-16">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
        </main>
    }
}
