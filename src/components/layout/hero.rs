/// Hero band — the largest focal region of the sheet.
///
/// Sits between the main projects and subprojects bands and grows to fill
/// whatever vertical room the bands above leave, so the sections below are
/// pushed to the bottom of the sheet. Its content follows the project selected
/// through the main projects marks.
///
/// The band shows at every breakpoint. The plate is text and an icon, so it
/// reflows into a narrow column rather than being cropped, and the selecting
/// marks are always on the same page — which is why they keep their tab
/// semantics on phones too.
///
use crate::components::effects::blob::{BlobBackground, BlobBackgroundProperties};
use crate::components::layout::main::SheetEntrance;
use crate::components::layout::mainprojects::{MainProject, SelectedProject, project_at};
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
/// The window body carries the selected project's name and description, centred
/// in the frame. It shows what the project is rather than embedding a page from
/// another site: the hero has no cross-origin dependency, so it needs no
/// `frame-src` or `frame-ancestors` allowance and costs nothing beyond the sheet
/// itself. The title and description are repeated from the main projects band by
/// design — the hero restates the selection as the sheet's focal plate, since
/// the selecting marks sit in a band above and are no longer in view.
///
/// A project with no public site uses the same body with its release note, so
/// the window's box never changes between selections.
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
        >
            <BlobBackground props=BlobBackgroundProperties {
                class: "hero-wash",
            } />
            {move || {
                let project = project_at(selected.0.get());
                view! { <HeroPlate project=project /> }
            }}
        </section>
    }
}

/// Window body for the selected project.
///
/// The window chrome belongs to the band, so this fills the body below the
/// `DaisyUI` title bar. It centres the project's mark, name and description in
/// the frame, which keeps the hero a plate of the selection rather than a second
/// copy of the panel's action buttons.
#[component]
fn HeroPlate(
    /// Project whose plate the hero shows.
    project: &'static MainProject,
) -> impl IntoView {
    let status = if project.disabled {
        project.established
    } else {
        project.description
    };

    view! {
        <div class="grid h-full w-full place-content-center gap-3 p-6 text-center">
            <div class="flex justify-center size-20 opacity-70" aria-hidden="true">
                {(project.icon)()}
            </div>
            <h2 class="text-lg font-semibold uppercase tracking-[0.08em]">{project.title}</h2>
            <p class="text-xs leading-relaxed opacity-60">{status}</p>
        </div>
    }
}
