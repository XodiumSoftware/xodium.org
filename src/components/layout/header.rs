use crate::components::ui::ascii_art::AsciiArt;
use leptos::prelude::*;

/// The sheet's opening band.
///
/// Holds the XODIUM glyph mark with a short prompt-style tagline. The keyboard
/// legend, link badges and title block are unmounted while the band is settled,
/// but they remain built and exported from the crate.
#[component]
#[must_use]
pub fn Header() -> impl IntoView {
    view! {
        <header
            class="flex items-center gap-4 pb-6 border-b border-base-content/40"
            aria-label="Site header"
        >
            <AsciiArt />
            <span class="text-xs uppercase tracking-[0.08em] header-tagline">
                <span class="opacity-50" aria-hidden="true">"> "</span>
                "Because we can."
            </span>
        </header>
    }
}
