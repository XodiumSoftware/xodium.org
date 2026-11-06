use crate::components::layout::main::SheetEntrance;
use crate::components::ui::ascii_art::AsciiArt;
use leptos::prelude::*;

/// The sheet's opening band.
///
/// Holds the XODIUM glyph mark with a short prompt-style tagline. The keyboard
/// legend, link badges and title block are unmounted while the band is settled,
/// but they remain built and exported from the crate.
///
/// It takes the load-in entrance from [`SheetEntrance`], so the rule under it
/// draws in with the stack rather than appearing fully formed before the bands
/// below it arrive.
#[component]
#[must_use]
pub fn Header() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    view! {
        <header
            class=move || {
                format!(
                    "sheet-band sheet-band-header {} flex items-center gap-4 pb-6 border-b border-base-content/40",
                    entrance.band_class(),
                )
            }
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
