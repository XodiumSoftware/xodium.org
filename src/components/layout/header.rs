use crate::components::layout::main::SheetEntrance;
use crate::components::ui::ascii_art::AsciiArt;
use leptos::prelude::*;

/// The page's opening band: the XODIUM mark and tagline.
#[component]
#[must_use]
pub fn Header() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    view! {
        <header
            class=move || {
                format!(
                    "sheet-band sheet-band-header {} flex flex-col gap-2 pb-6 sm:flex-row sm:items-center sm:gap-4",
                    entrance.band_class(),
                )
            }
            aria-label="Site header"
        >
            <div class="min-w-0 flex-1 max-w-[calc(43.2*0.585rem)] [container-type:inline-size]">
                <AsciiArt />
            </div>
            <span class="shrink-0 text-xs uppercase tracking-[0.08em] animate-[slide-up_400ms_ease-out_500ms_both] motion-reduce:animate-none">
                <span class="opacity-50" aria-hidden="true">"> "</span>
                "Because we can."
            </span>
        </header>
    }
}
