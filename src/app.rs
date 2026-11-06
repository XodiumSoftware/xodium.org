//! Root application component and the single-page layout.
//!
//! `App` assembles the skip link, main content section, footer, and the
//! bottom-right corner metadata stack into one blueprint-styled page.

use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use crate::components::sections::main::Main;
use leptos::prelude::*;

/// The full single-page blueprint drawing.
///
/// Renders a fixed-layout page: the main content section fills the viewport,
/// the corner stack sits bottom-right, and the footer sits bottom-left.
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

            <Main />

            <Footer />

            <Header />
        </div>
    }
}
