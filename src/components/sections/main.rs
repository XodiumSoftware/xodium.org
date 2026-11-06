//! Main content section.
//!
//! Hosts the accessible page heading and stacks the layout regions that make
//! up the sheet, in reading order.

use crate::components::sections::footer::Footer;
use crate::components::sections::layout::banner::Banner;
use crate::components::sections::layout::hero::Hero;
use crate::components::sections::layout::tri_column::TriColumn;
use crate::components::sections::layout::two_column::TwoColumn;
use leptos::prelude::*;

/// The central content area of the page.
///
/// The drawing sheet owns the page width and centring, so this only supplies
/// the inner gutter and stacks the bands from banner to footer. The bands are
/// presentation-only placeholders until real content is designed for each.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col px-6">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

            <Banner />
            <TwoColumn />
            <Hero />
            <TriColumn />
            <Footer />
        </main>
    }
}
