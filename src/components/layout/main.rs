//! Main content section.
//!
//! Hosts the accessible page heading and stacks the layout regions that make
//! up the sheet, in reading order.

use crate::components::layout::footer::Footer;
use crate::components::layout::header::Header;
use crate::components::layout::hero::Hero;
use crate::components::layout::mainprojects::{MainProjects, SelectedProject};
use crate::components::layout::subprojects::Subprojects;
use leptos::prelude::*;

/// The central content area of the page.
///
/// The drawing sheet owns the page width and centring, so this only supplies
/// the inner gutter and stacks the bands from header to footer. It also owns
/// the selected-project state shared by the main projects marks and the hero.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let _ = SelectedProject::provide();

    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col px-6">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

            <Header />
            <MainProjects />
            <Hero />
            <Subprojects />
            <Footer />
        </main>
    }
}
