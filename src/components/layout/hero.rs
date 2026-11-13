/// Hero band — the largest focal region of the sheet.
///
/// Sits between the main projects and subprojects bands and grows to fill
/// whatever vertical room the bands above leave, so the sections below are
/// pushed to the bottom of the sheet. Its content follows the project selected
/// through the main projects marks.
///
/// The band shows at every breakpoint. The plate is a title and a line of text,
/// so it reflows into a narrow column rather than being cropped, and the
/// selecting marks are always on the same page — which is why they keep their tab
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
/// The window body carries the selected project's feature cards, laid out as a
/// mosaic of differently sized tiles. It shows what the project offers rather
/// than embedding a page from another site: the hero has no cross-origin
/// dependency, so it needs no `frame-src` or `frame-ancestors` allowance.
///
/// The cards are inert — plain `<div>`s, no links and no focus targets — so the
/// plate stays the marks' `tabpanel` without adding tab stops inside it. A
/// project still under wraps shows a single plain card saying so, rather than a
/// grid it cannot fill.
///
/// Below `sm` the band sizes to its content instead: `grow-0` cancels the
/// `grow` that absorbs leftover height, and `basis-auto` lets the stacked tiles
/// decide the height, so the mosaic is never clipped by a share of the sheet.
///
/// The band's `p-6` is the only inset: from `sm` up the window stretches to the
/// remaining box on both axes, so it frames the hero instead of floating in the
/// middle of it. `min-h-0` lets it shrink inside the flex-column band rather
/// than forcing the band taller than its share of the sheet.
///
/// Three rules in `public/style.css` back this band:
///
/// - `.sheet-band-hero` only carries its `--band-delay`. The stacking context
///   that keeps the wash behind the window is utilities (`relative isolate`):
///   the wash is a `-z-1` layer, and without the isolation it would drop
///   through the sheet to the page surface.
///
/// - `.sheet-band-hero .mockup-window::before` draws the traffic lights. DaisyUI
///   stamps all three dots from one `::before` with a `box-shadow`, so the rule
///   replaces the shadow stops with the theme's error, warning and success
///   colours and restores `opacity: 1` to undo the 30% veil DaisyUI applies.
///   Changing the dot count means editing those stops, not the markup.
///
/// - The wash's placement is utilities on the `<svg>` itself
///   (`absolute inset-0 -z-1 w-full h-full pointer-events-none`), passed in as
///   [`BlobBackgroundProperties::class`](crate::components::effects::blob::BlobBackgroundProperties::class)
///   so [`BlobBackground`] stays position-agnostic.
#[component]
#[must_use]
pub fn Hero() -> impl IntoView {
    let selected = SelectedProject::use_context();
    let entrance = SheetEntrance::use_context();

    view! {
        <section
            class=move || {
                format!(
                    "sheet-band sheet-band-hero {} relative isolate p-6 grow-0 basis-auto sm:grow sm:basis-80 min-h-0 border-x border-b border-base-content/40",
                    entrance.band_class(),
                )
            }
            aria-label="Featured project"
        >
            <BlobBackground props=BlobBackgroundProperties {
                class: "absolute inset-0 -z-1 w-full h-full pointer-events-none",
            } />
            {move || {
                let project = project_at(selected.0.get());
                view! { <HeroPlate project=project /> }
            }}
        </section>
    }
}

/// Returns the tile face utilities for a mosaic tile.
///
/// Every tile is filled with `bg-base-100`, never transparent and never a
/// different surface: that is the token `body::before` paints the page with, so a
/// card reads as paper laid on paper rather than as a raised panel floating in the
/// window. The window body uses the same fill, which is why the cards need their
/// border to stay legible.
const TILE_CLASS: &str = "col-span-1 min-h-20 bg-base-100 border border-base-content/30 p-3";

/// Window body for the selected project.
///
/// The window chrome belongs to the band, so this fills the body below the
/// `DaisyUI` title bar with the project's feature mosaic. It does not repeat the
/// project's name or mark: the title is already the panel heading one band above
/// and the glyph is painted large on the selecting mark, so either would only
/// compete with the cards for the plate's space.
///
/// The grid is one column below `sm` so a phone reads a straight list, two up from
/// `sm` where the tiles are still small enough to pair, and four up from `md`,
/// where the authored spans take over. `grid-flow-dense` pulls later tiles into
/// any gap a spanning tile leaves, which is what makes the mix read as a puzzle
/// instead of a ladder of holes. `auto-rows-min` keeps every tile at its content
/// height, so the mosaic never forces the band taller than the sheet's share.
///
/// `content-center` is applied only to a plate that has a single card, so that
/// card hangs in the middle of the window instead of being pinned to its top
/// edge. It is not set on the grid generally: it would also lift a full mosaic
/// off the top of the plate when its rows do not fill the band.
#[component]
fn HeroPlate(
    /// Project whose mosaic the hero shows.
    project: &'static MainProject,
) -> impl IntoView {
    let tiles = project
        .cards
        .iter()
        .map(|card| {
            let tile_class = format!("{TILE_CLASS} {}", card.span);
            view! {
                <div class=tile_class>
                    <h3 class="text-xs font-semibold uppercase tracking-[0.08em]">{card.title}</h3>
                    <p class="text-xs leading-relaxed opacity-60">{card.body}</p>
                </div>
            }
        })
        .collect_view();

    let grid_class = if project.cards.len() == 1 {
        "grid h-full w-full grid-flow-dense auto-rows-min content-center grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-6"
    } else {
        "grid h-full w-full grid-flow-dense auto-rows-min grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-6"
    };

    view! {
        <div class=grid_class>{tiles}</div>
    }
}
