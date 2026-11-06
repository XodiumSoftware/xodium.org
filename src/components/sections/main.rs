//! Main content section.
//!
//! Hosts the accessible page heading for the single-page layout.

use leptos::prelude::*;

/// The central content area of the page.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    view! {
        <main id="main-content" tabindex="-1">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
        </main>
    }
}
