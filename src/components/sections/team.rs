//! Team modal section.
//!
//! Opens when the user activates the "Team" cube in the isometric scene and
//! shows the Xodium GitHub members as large round avatars.

use crate::github::Member;
use leptos::prelude::*;
use std::rc::Rc;

/// Props for the [`Team`] modal.
#[derive(Clone)]
#[must_use]
pub struct TeamProperties {
    /// Members to display inside the modal.
    pub members: Vec<Member>,
    /// Callback invoked when the modal should close (backdrop click or Escape).
    pub on_close: Rc<dyn Fn() + 'static>,
}

/// Modal overlay showing the Xodium team as large round avatars.
///
/// The modal is a barebones centered card over a translucent backdrop.
/// Pressing Escape or clicking the backdrop closes it. Each avatar links to
/// the member's GitHub profile in a new tab.
#[component]
#[must_use]
pub fn Team(
    /// Configuration: member list and close callback.
    props: TeamProperties,
) -> impl IntoView {
    let TeamProperties { members, on_close } = props;
    let close = on_close.clone();

    view! {
        <div
            class="team-modal-backdrop"
            role="presentation"
            on:click=move |_| on_close()
        >
            <div
                class="team-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Team members"
                on:click=move |ev| ev.stop_propagation()
                on:keydown=move |ev| {
                    if ev.key() == "Escape" {
                        close();
                    }
                }
            >
                {members
                    .into_iter()
                    .map(|member| {
                        let Member {
                            login,
                            html_url,
                            avatar_url,
                            role,
                        } = member;
                        let label = format!(
                            "{login} — {role}",
                            role = role.as_deref().unwrap_or("Member"),
                        );
                        view! {
                            <a
                                class="team-modal-avatar"
                                href=html_url
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label=label
                            >
                                <img src=avatar_url alt=login loading="lazy" />
                            </a>
                        }
                    })
                    .collect_view()}
            </div>
        </div>
    }
}
