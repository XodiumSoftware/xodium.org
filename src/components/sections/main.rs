//! Main drawing viewport section.
//!
//! Hosts the isometric [`ThreeDScene`], the interactive objects that make up
//! the blueprint drawing, and the [`Team`] modal that is opened from the scene.

use crate::components::sections::three_d::ThreeDScene;
use crate::components::ui::shapes::{Attachment, Container, Face, FaceColors, ThreeDProperties};
use crate::github::fetch_members;
use crate::utils::CADIOTHEKA_URL;
use leptos::prelude::*;

/// The central drawing viewport containing the isometric scene.
///
/// Defines the interactive project blocks — Cadiotheka, the bouncing team
/// avatar block, and an upcoming draft — and renders them via [`ThreeDScene`].
/// The team block fetches GitHub members and displays their avatars as
/// particles confined inside the cube.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let members =
        LocalResource::new(move || async move { fetch_members().await.unwrap_or_default() });

    view! {
        <main id="main-content" tabindex="-1">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
            <ThreeDScene objects=move || {
                let content = members.get().map(Container::Avatars);
                vec![
                    ThreeDProperties {
                        id: "cadiotheka_project",
                        name: "Cadiotheka",
                        url: Some(CADIOTHEKA_URL),
                        ..Default::default()
                    },
                    ThreeDProperties {
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
                        content,
                        ..Default::default()
                    },
                    ThreeDProperties {
                        id: "draft_1",
                        name: "SOON™",
                        attached_to: Some(Attachment::Face {
                            target: "team_hub",
                            face: Face::Top,
                        }),
                        is_draft: true,
                        ..Default::default()
                    },
                ]
            } />
        </main>
    }
}
