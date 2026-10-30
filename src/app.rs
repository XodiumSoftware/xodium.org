//! Root application component and the single-page layout.
//!
//! `App` assembles the skip link, main drawing viewport, footer, and the
//! bottom-right corner metadata stack into one blueprint-styled page. A
//! dedicated "Team" object in the isometric scene opens a modal with the
//! Xodium GitHub team.

use crate::components::scenes::object_3d_scene::Object3dScene;
use crate::components::sections::footer::Footer;
use crate::components::sections::header::Header;
use crate::components::ui::object_3d::{Attachment, Face, FaceColors, Object3dProperties, Shape};
use crate::components::ui::team_modal::TeamModal;
use crate::utils::CADIOTHEKA_URL;
use leptos::prelude::*;
use std::rc::Rc;

/// The full single-page blueprint drawing.
///
/// Renders a fixed-layout page: the isometric drawing viewport fills the
/// viewport, the corner stack sits bottom-right, and the footer sits
/// bottom-left. The only interactive 3D objects are defined here and passed
/// to [`Object3dScene`] for placement and rendering. Clicking the "Team"
/// object opens [`TeamModal`].
#[component]
#[must_use]
pub fn App() -> impl IntoView {
    let show_team = RwSignal::new(false);

    let team_object = Object3dProperties {
        id: "team_hub",
        name: "Team",
        shape: Shape::Cube(70.0),
        attached_to: Some(Attachment::Face {
            target: "cadiotheka_project",
            face: Face::Front,
        }),
        colors: Some(FaceColors {
            top: "var(--color-primary)",
            left: "var(--color-secondary)",
            right: "var(--color-accent)",
        }),
        on_click: Some(Rc::new(move || show_team.set(true))),
        ..Default::default()
    };

    view! {
        <div class="blueprint-frame">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <main id="main-content" tabindex="-1">
                <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
                <Object3dScene objects=vec![
                    Object3dProperties {
                        id: "cadiotheka_project",
                        name: "Cadiotheka",
                        url: Some(CADIOTHEKA_URL),
                        ..Default::default()
                    },
                    Object3dProperties {
                        id: "draft_0",
                        name: "SOON™",
                        attached_to: Some(Attachment::Face {
                            target: "cadiotheka_project",
                            face: Face::Left,
                        }),
                        is_draft: true,
                        ..Default::default()
                    },
                    Object3dProperties {
                        id: "draft_1",
                        name: "SOON™",
                        attached_to: Some(Attachment::Face {
                            target: "draft_0",
                            face: Face::Top,
                        }),
                        is_draft: true,
                        ..Default::default()
                    },
                    team_object,
                ] />
            </main>

            <TeamModal open=show_team />

            <Footer />

            <Header />
        </div>
    }
}
