use crate::components::ui::ascii_art::AsciiArt;
use crate::components::ui::legend_block::LegendBlock;
use crate::components::ui::link_badges::LinkBadges;
use crate::components::ui::title_block::TitleBlock;
use leptos::prelude::*;

/// The bottom-right corner assembly — the grouped metadata cluster on the
/// drawing sheet. Stacks the XODIUM ASCII header, a horizontal separator,
/// the legend, and the framed LinkBadges + TitleBlock pair into a single
/// fixed-positioned block.
#[component]
#[must_use]
pub fn CornerCluster() -> impl IntoView {
    view! {
        <aside class="corner-stack" aria-label="Sheet metadata and external links">
            <AsciiArt />
            <hr class="corner-stack-sep" />
            <LegendBlock />
            <div class="title-block-anchor">
                <LinkBadges />
                <TitleBlock />
            </div>
        </aside>
    }
}
