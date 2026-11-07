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
///
/// On phones the band stacks, putting the tagline under the glyph mark, because
/// mark and note side by side leave the mark too narrow to hold its 72 columns.
/// From `sm` up they sit on one line again, with the note trailing the mark.
///
/// The tagline's reveal is delayed past the mark's, so the opener reads as one
/// line being drawn left to right: mark, then note.
#[component]
#[must_use]
pub fn Header() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    view! {
        <header
            class=move || {
                format!(
                    "sheet-band sheet-band-header {} flex flex-col gap-2 pb-6 border-b border-base-content/40 sm:flex-row sm:items-center sm:gap-4",
                    entrance.band_class(),
                )
            }
            aria-label="Site header"
        >
            <AsciiArt />
            <span class="text-xs uppercase tracking-[0.08em] animate-[slide-up_400ms_ease-out_500ms_both] motion-reduce:animate-none">
                <span class="opacity-50" aria-hidden="true">"> "</span>
                "Because we can."
            </span>
        </header>
    }
}
