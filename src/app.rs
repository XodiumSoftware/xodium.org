//! Root application component and the single-page layout.
//!
//! `App` assembles the skip link and main content section into one
//! blueprint-styled page.

use crate::components::sections::main::Main;
use leptos::prelude::*;

/// The full single-page blueprint drawing.
///
/// The header and footer are deliberately unmounted while the main column is
/// being settled; both are still built and exported from the crate.
#[component]
#[must_use]
pub fn App() -> impl IntoView {
    view! {
        <div class="blueprint-frame">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <div class="blueprint-sheet">
                <Main />
            </div>
        </div>
    }
}
