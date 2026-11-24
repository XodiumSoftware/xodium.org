use crate::components::ui::ascii_art::AsciiArt;
use leptos::prelude::*;

/// The page's opening band: the XODIUM mark and tagline.
#[component]
#[must_use]
pub fn Header() -> impl IntoView {
    view! {
        <header
            class="flex flex-col gap-2 pb-6 sm:flex-row sm:items-center sm:gap-4 border-b border-x border-base-content/40"
            aria-label="Site header"
        >
            <div class="min-w-0 flex-1 max-w-[calc(43.2*0.585rem)] pl-6 [container-type:inline-size]">
                <AsciiArt />
            </div>
            <span class="tagline-enter shrink-0 text-xs uppercase tracking-[0.08em]">
                <span class="opacity-50" aria-hidden="true">"> "</span>
                "Because we can."
            </span>
        </header>
    }
}
