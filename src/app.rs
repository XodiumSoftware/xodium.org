//! Root application component and the single-page layout.
//!
//! `App` assembles the skip link, main drawing viewport, footer, and the
//! bottom-right corner metadata stack into one blueprint-styled page. A
//! dedicated "Team" object in the isometric scene opens a modal with the
//! Xodium GitHub team.

use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use crate::components::sections::main::Main;
use crate::components::sections::team::Team;
use leptos::prelude::*;
use std::rc::Rc;

/// The full single-page blueprint drawing.
///
/// Renders a fixed-layout page: the isometric drawing viewport fills the
/// viewport, the corner stack sits bottom-right, and the footer sits
/// bottom-left. The only interactive 3D objects are defined in [`Main`] and
/// rendered by [`Object3dScene`](crate::components::scenes::object_3d_scene::Object3dScene).
/// Clicking the "Team" object opens [`Team`].
#[component]
#[must_use]
pub fn App() -> impl IntoView {
    let show_team = RwSignal::new(false);
    let open_team = Rc::new(move || show_team.set(true));

    view! {
        <div class="blueprint-frame">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <Main on_open_team=open_team />

            <Team open=show_team />

            <Footer />

            <Header />
        </div>
    }
}
