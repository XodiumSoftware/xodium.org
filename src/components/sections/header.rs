use crate::components::ui::ascii_art::AsciiArt;
use crate::components::ui::legend_block::LegendBlock;
use crate::components::ui::link_badges::LinkBadges;
use crate::components::ui::title_block::TitleBlock;
use leptos::prelude::*;

/// The bottom-right corner assembly. Despite the file name, this is NOT a
/// top-of-page header — it's the sheet metadata block that lives at the
/// bottom-right of the drawing.
#[component]
#[must_use]
pub fn Header() -> impl IntoView {
    view! {
        <aside class="corner-stack" aria-label="Sheet metadata and external links">
            <AsciiArt />
            <hr class="corner-stack-sep" />
            <div class="title-block-anchor">
                <LinkBadges />
                <TitleBlock />
            </div>
            <LegendBlock />
        </aside>
    }
}
