//! Main drawing viewport section.
//!
//! Hosts the isometric [`ThreeDScene`] and the interactive objects that make up
//! the blueprint drawing. Clicking the "Team" cube opens the [`Team`] modal.

use crate::components::sections::team::{Team, TeamProperties};
use crate::components::sections::three_d::ThreeDScene;
use crate::components::ui::shapes::{Attachment, Container, Face, FaceColors, ThreeDProperties};
use crate::github::{Member, fetch_members};
use crate::utils::CADIOTHEKA_URL;
use leptos::prelude::*;
use std::rc::Rc;

/// The central drawing viewport containing the isometric scene.
///
/// Defines the interactive project blocks — Cadiotheka, the bouncing team
/// avatar block, and an upcoming draft — and renders them via [`ThreeDScene`].
/// The team block fetches GitHub members and opens a modal with the full team
/// list when it is activated.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let members =
        LocalResource::new(move || async move { fetch_members().await.unwrap_or_default() });
    let (modal_members, set_modal_members) = signal(Vec::<Member>::new());
    let (modal_open, set_modal_open) = signal(false);

    let open_team = {
        let set_open = set_modal_open;
        let set_members = set_modal_members;
        move |list: Vec<Member>| {
            set_members.set(list);
            set_open.set(true);
        }
    };

    view! {
        <main id="main-content" tabindex="-1">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>
            <ThreeDScene objects=move || {
                let members_for_cube = members.get();
                let content = members_for_cube.clone().map(Container::Avatars);
                let members_for_click = members_for_cube.unwrap_or_default();
                let open_team_click = open_team;
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
                        on_click: Some(Rc::new(move || {
                            open_team_click(members_for_click.clone());
                        })),
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

            <Show when=move || modal_open.get()>
                <Team props=TeamProperties {
                    members: modal_members.get(),
                    on_close: Rc::new(move || set_modal_open.set(false)),
                } />
            </Show>
        </main>
    }
}
