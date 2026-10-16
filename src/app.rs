use crate::components::ui::title_block::TitleBlock;
use crate::components::ui::viewport::Viewport;
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
                <div class="viewport-grid">
                    <Viewport title="{placeholder}">
                        <div></div>
                    </Viewport>
                    <Viewport title="{placeholder}">
                        <div></div>
                    </Viewport>
                    <Viewport title="{placeholder}">
                        <div></div>
                    </Viewport>
                </div>
            </main>

            <aside class="title-block-anchor" aria-label="Sheet metadata">
                <TitleBlock />
            </aside>
        </div>
    }
}
