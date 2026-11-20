//! Main content section.

use crate::components::layout::footer::Footer;
use crate::components::layout::header::Header;
use crate::components::layout::hero::Hero;
use crate::components::layout::subprojects::Subprojects;
use leptos::prelude::*;

/// The central content area of the page.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

            <Header />
            <Hero />
            <Subprojects />
            <Footer />
        </main>
    }
}
