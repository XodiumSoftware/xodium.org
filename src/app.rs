use crate::components::ui::link_badges::LinkBadges;
use crate::components::ui::revision_ledger::RevisionLedger;
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
            </main>

            <aside class="corner-stack" aria-label="Sheet metadata and external links">
                <RevisionLedger />
                <div class="title-block-anchor">
                    <LinkBadges />
                    <TitleBlock />
                </div>
            </aside>
        </div>
    }
}
