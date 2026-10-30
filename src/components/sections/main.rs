//! Main drawing viewport section.
//!
//! Hosts the isometric [`ThreeDScene`], the interactive objects that make up
//! the blueprint drawing, and the [`Team`] modal that is opened from the scene.

use crate::components::sections::team::Team;
use crate::components::sections::three_d::ThreeDScene;
use crate::components::ui::shapes::{Attachment, Face, FaceColors, Object3dProperties};
use crate::utils::CADIOTHEKA_URL;
use leptos::prelude::*;
use std::rc::Rc;

/// The central drawing viewport containing the isometric scene.
///
/// Defines the interactive project blocks — Cadiotheka, two upcoming drafts,
/// and the Team block — and renders them via [`ThreeDScene`]. Clicking the
/// "Team" object opens the [`Team`] modal rendered alongside the viewport.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let show_team = RwSignal::new(false);
    let open_team: Rc<dyn Fn() + 'static> = Rc::new(move || show_team.set(true));

    view! {
        <main id="main-content" tabindex="-1">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
            <ThreeDScene objects=vec![
                Object3dProperties {
                    id: "cadiotheka_project",
                    name: "Cadiotheka",
                    url: Some(CADIOTHEKA_URL),
                    ..Default::default()
                },
                Object3dProperties {
                    id: "team_hub",
                    name: "Team",
                    attached_to: Some(Attachment::Face {
                        target: "cadiotheka_project",
                        face: Face::Left,
                    }),
                    colors: Some(FaceColors {
                        top: "var(--color-primary)",
                        left: "var(--color-secondary)",
                        right: "var(--color-accent)",
                    }),
                    on_click: Some(Rc::clone(&open_team)),
                    ..Default::default()
                },
                Object3dProperties {
                    id: "draft_1",
                    name: "SOON™",
                    attached_to: Some(Attachment::Face {
                        target: "team_hub",
                        face: Face::Top,
                    }),
                    is_draft: true,
                    ..Default::default()
                },
            ] />
        </main>

        <Team open=show_team />
    }
}
