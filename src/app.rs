//! Root application component.

use crate::components::layout::main::Main;
use leptos::prelude::*;

/// The full single-page drawing.
#[component]
#[must_use]
pub fn App() -> impl IntoView {
    view! {
        <div class="relative flex min-h-dvh flex-col">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <div class="sheet-frame relative flex flex-1 flex-col w-[calc(100%-36px)] max-w-5xl mx-auto border-x border-base-content/40">
                <Main />
            </div>
        </div>
    }
}
