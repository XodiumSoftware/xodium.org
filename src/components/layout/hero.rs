//! Hero band — the largest focal region of the sheet.
//!
//! Sits between the main projects and subprojects bands and grows to fill
//! whatever vertical room the bands above leave, so the sections below are
//! pushed to the bottom of the sheet. Its content follows the project selected
//! through the main projects marks.

use crate::components::layout::main::SheetEntrance;
use crate::components::layout::mainprojects::{SelectedProject, project_at};
use leptos::prelude::*;

/// Large focal region in the middle of the sheet.
///
/// `grow` lets it absorb the sheet's leftover height, which is what pushes the
/// rows below it downwards. Once the content is taller than the sheet, the hero
/// keeps its natural height and the page scrolls normally.
///
/// The heading and copy swap when a different project is selected above, and the
/// `aria-live` region announces the change for assistive technology.
///
/// The featured project sits inside a `DaisyUI` mockup window using its
/// background variant, tinted with `base-100` so the panel reads as a window
/// cut into the sheet rather than a raised surface. Its border is the same
/// `base-content/40` rule as the band borders, so the window frames the hero in
/// the sheet's own line colour.
///
/// The band's `p-6` is the only inset: the window stretches to the remaining
/// box on both axes, so it frames the hero instead of floating in the middle
/// of it. `min-h-0` lets it shrink inside the flex-column band rather than
/// forcing the band taller than its share of the sheet.
#[component]
#[must_use]
pub fn Hero() -> impl IntoView {
    let selected = SelectedProject::use_context();
    let entrance = SheetEntrance::use_context();

    view! {
        <section
            class=move || {
                format!(
                    "sheet-band sheet-band-hero {} p-6 grow basis-80 min-h-0 border-x border-b border-base-content/40",
                    entrance.band_class(),
                )
            }
            aria-label="Featured project"
            aria-live="polite"
        >
            {move || {
                let project = project_at(selected.0.get());
                view! {
                    <div class="mockup-window bg-base-100 border border-base-content/40 rounded-lg h-full w-full overflow-hidden">
                        <div class="grid flex-1 place-content-center overflow-auto p-6">
                            <div class="flex flex-col items-center gap-2 text-center">
                                <h2 class="text-lg font-semibold uppercase tracking-[0.08em]">
                                    {project.title}
                                </h2>
                                <p class="text-xs leading-relaxed text-base-content/70">
                                    {project.description}
                                </p>
                            </div>
                        </div>
                    </div>
                }
            }}
        </section>
    }
}
