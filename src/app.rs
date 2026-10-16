use crate::components::sections::footer::Footer;
use crate::components::ui::coord_picker::CoordPicker;
use crate::components::ui::effects::iso_viewport::IsoViewport;
use crate::components::ui::link_badges::LinkBadges;
use crate::components::ui::title_block::TitleBlock;
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
                <section class="iso-viewport-section">
                    <IsoViewport />
                </section>
            </main>

            <CoordPicker />

            <Footer />

            <aside class="corner-stack" aria-label="Sheet metadata and external links">
                <div class="title-block-anchor">
                    <LinkBadges />
                    <TitleBlock />
                </div>
            </aside>
        </div>
    }
}
