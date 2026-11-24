//! Root application component.

use crate::components::layout::footer::Footer;
use crate::components::layout::header::Header;
use crate::components::layout::hero::Hero;
use crate::components::layout::subprojects::Subprojects;
use crate::components::ui::spotlight::track_spotlights;
use leptos::prelude::*;

/// The full single-page drawing.
#[component]
#[must_use]
pub fn App() -> impl IntoView {
    track_spotlights();

    view! {
        <div class="relative flex min-h-dvh flex-col">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <main
                id="main-content"
                tabindex="-1"
                class="sheet-frame relative flex flex-1 flex-col w-[calc(100%-36px)] max-w-5xl mx-auto"
            >
                <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

                <Header />
                <Hero />
                <Subprojects />
                <Footer />
            </main>
        </div>
    }
}
