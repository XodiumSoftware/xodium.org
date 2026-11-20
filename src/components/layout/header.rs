use crate::components::layout::main::SheetEntrance;
use crate::components::ui::ascii_art::AsciiArt;
use leptos::prelude::*;

/// The sheet's opening band: the XODIUM mark with a short tagline.
///
/// A column on phones and a row from `sm` up, so the tagline moves under the
/// mark rather than beside it. The mark sits in its own wrapper because that
/// wrapper is the size container its fitted `font-size` measures against; the
/// wrapper is capped at the mark's maximum width so a wide band does not push
/// the tagline to the far edge. See [`AsciiArt`] for the sizing itself.
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
