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
///
/// The mark sits in its own wrapper, and that wrapper is the size container its
/// fitted `font-size` measures against. Putting the containment on the band
/// instead would measure the whole band: from `sm` up the band is a flex row, so
/// the mark would size itself against the row including the tagline's share and
/// could overlap the note.
///
/// The wrapper takes the row's free space (`flex-1`) and is capped at the mark's
/// maximum width (`max-w-[calc(43.2*0.585rem)]`, the block's 43.2em at its
/// 0.585rem cap). Capping matters: with plain `flex-1` the wrapper stretched to
/// the whole band on a wide screen and pushed the tagline out to the far edge,
/// instead of sitting a `gap-4` after the mark. The `cqi` the mark measures is
/// then that resolved width, never the tagline's share.
///
/// Sizing the wrapper to its content instead would not work either: a container
/// query unit resolves against the container, and a width taken from the
/// contained mark's own overflow never converges.
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
