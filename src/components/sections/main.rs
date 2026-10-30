//! Main drawing viewport section.
//!
//! Hosts the isometric [`Object3dScene`] and the interactive objects that make
//! up the blueprint drawing. Kept separate from [`App`](crate::app::App) so the
//! scene data and modal trigger logic live close to the other page sections.

use crate::components::scenes::object_3d_scene::Object3dScene;
use crate::components::ui::object_3d::{Attachment, Face, FaceColors, Object3dProperties, Shape};
use crate::utils::CADIOTHEKA_URL;
use leptos::prelude::*;
use std::rc::Rc;

/// Properties for the main drawing viewport.
#[derive(Clone)]
#[must_use]
pub struct MainProperties {
    /// Callback invoked when the user activates the "Team" object.
    pub on_open_team: Rc<dyn Fn() + 'static>,
}

/// The central drawing viewport containing the isometric scene.
///
/// Defines the interactive project blocks — Cadiotheka, two upcoming drafts,
/// and the Team block — and renders them via [`Object3dScene`]. Clicking the
/// "Team" object fires `on_open_team` to open the team modal managed by the
/// parent [`App`](crate::app::App).
#[component]
#[allow(clippy::needless_pass_by_value)]
#[must_use]
pub fn Main(
    /// Callback fired when the Team object is activated.
    on_open_team: Rc<dyn Fn() + 'static>,
) -> impl IntoView {
    let on_open_team_click = Rc::clone(&on_open_team);

    view! {
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
                Object3dProperties {
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
                    on_click: Some(on_open_team_click),
                    ..Default::default()
                },
            ] />
        </main>
    }
}
