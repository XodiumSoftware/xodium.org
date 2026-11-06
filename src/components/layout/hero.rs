//! Hero band — the largest focal region of the sheet.
//!
//! Sits between the main projects and subprojects bands and grows to fill
//! whatever vertical room the bands above leave, so the sections below are
//! pushed to the bottom of the sheet. Its content follows the project selected
//! through the main projects marks.

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
#[component]
#[must_use]
pub fn Hero() -> impl IntoView {
    let selected = SelectedProject::use_context();

    view! {
        <section
            class="sheet-band sheet-band-hero grid place-items-center grow basis-80 py-16 border-b border-base-content/40"
            aria-label="Featured project"
            aria-live="polite"
        >
            {move || {
                let project = project_at(selected.0.get());
                view! {
                    <div class="flex flex-col items-center gap-2 text-center">
                        <h2 class="text-lg font-semibold uppercase tracking-[0.08em]">
                            {project.title}
                        </h2>
                        <p class="text-xs leading-relaxed text-base-content/70">
                            {project.description}
                        </p>
                    </div>
                }
            }}
        </section>
    }
}
