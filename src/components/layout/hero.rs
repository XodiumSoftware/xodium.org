/// Hero band — the largest focal region of the sheet.
///
/// Sits between the main projects and subprojects bands and grows to fill
/// whatever vertical room the bands above leave, so the sections below are
/// pushed to the bottom of the sheet. Its content follows the project selected
/// through the main projects marks.
///
/// The band is hidden below `sm`: the framed page lays out at its natural
/// desktop width, so a phone-sized window would show a crop of it rather than a
/// readable preview, and the sheet reads better as a straight stack there. Only
/// the hero's own `border-b` goes with it — the side rules are drawn by
/// `.blueprint-sheet::before`, so the frame stays closed.
use crate::components::effects::blob::{BlobBackground, BlobBackgroundProperties};
use crate::components::layout::main::SheetEntrance;
use crate::components::layout::mainprojects::{SelectedProject, project_at};
use crate::components::ui::hero_demo::{HeroDemo, HeroDemoProperties};
use leptos::prelude::*;

/// Large focal region in the middle of the sheet.
///
/// `grow` lets it absorb the sheet's leftover height, which is what pushes the
/// rows below it downwards. Once the content is taller than the sheet, the hero
/// keeps its natural height and the page scrolls normally.
///
/// The featured project sits inside a `DaisyUI` mockup window using its
/// background variant, tinted with `base-100` so the panel reads as a window
/// cut into the sheet rather than a raised surface. Its border is the same
/// `base-content/40` rule as the band borders, so the window frames the hero in
/// the sheet's own line colour.
///
/// The window body is a live [`HeroDemo`] frame of the selected project's site,
/// so the hero shows the running app rather than a description of it. The
/// project title and description now live only in the main projects band, which
/// avoids restating them in two places on one sheet.
///
/// A project without a live site gets a placeholder instead, which keeps the
/// window's box so the sheet does not jump when the selection changes.
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
                    "sheet-band sheet-band-hero {} p-6 grow basis-80 min-h-0 border-x border-b border-base-content/40 max-sm:hidden",
                    entrance.band_class(),
                )
            }
            aria-label="Featured project"
        >
            <BlobBackground props=BlobBackgroundProperties {
                class: "hero-wash",
            } />
            {move || {
                let project = project_at(selected.0.get());
                let body = match project.demo {
                    Some(frame) => {
                        view! {
                            <HeroDemo props=HeroDemoProperties { frame } />
                        }
                            .into_any()
                    }
                    None => view! { <HeroPlaceholder title=project.title /> }.into_any(),
                };
                view! {
                    <div class="mockup-window bg-base-100 border border-base-content/40 rounded-lg h-full w-full overflow-hidden">
                        {body}
                    </div>
                }
            }}
        </section>
    }
}

/// Window body for a project that has no live site to show yet.
///
/// It keeps the window's box and centres the project name, so a project that is
/// still under wraps fills the hero without pretending to be a running app.
#[component]
fn HeroPlaceholder(
    /// Name of the project awaiting a demo.
    title: &'static str,
) -> impl IntoView {
    view! {
        <div class="grid h-full w-full place-content-center p-6 text-center">
            <h2 class="text-lg font-semibold uppercase tracking-[0.08em] opacity-60">
                {title}
            </h2>
        </div>
    }
}
