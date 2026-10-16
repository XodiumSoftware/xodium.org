use crate::components::sections::building_block::{BuildingBlock, BuildingBlockProperties};
use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use leptos::prelude::*;

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

            <main id="main-content" tabindex="-1">
                <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
                <BuildingBlock props=BuildingBlockProperties::default() />
            </main>

            <Footer />

            <Header />
        </div>
    }
}
