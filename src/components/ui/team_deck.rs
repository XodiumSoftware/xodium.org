use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;

use crate::github::{Member, fetch_members};

/// Maximum number of avatars displayed before collapsing the rest into a
/// "+N" counter.
const VISIBLE_AVATARS: usize = 4;

/// Clickable panel that expands leftwards into a stack of GitHub team member
/// avatars.
///
/// The deck sits to the left of the external link badges and starts collapsed.
/// Clicking the panel (or pressing `Alt + T`) reveals the team stack and
/// fetches the member list on first open. Members are rendered as a DaisyUI
/// `avatar-group` with a "+N" placeholder once the count exceeds
/// `VISIBLE_AVATARS`.
#[component]
#[must_use]
pub fn TeamDeck() -> impl IntoView {
    let (expanded, set_expanded) = signal(false);
    let (announcement, set_announcement) = signal(String::new());

    let members =
        LocalResource::new(move || async move { fetch_members().await.unwrap_or_default() });

    let toggle = move || {
        let next = !expanded.get_untracked();
        set_expanded.set(next);
        set_announcement.set(if next {
            "Team deck expanded.".to_string()
        } else {
            "Team deck collapsed.".to_string()
        });
    };

    Effect::new(move |_| {
        use leptos::wasm_bindgen::closure::Closure;
        use leptos::web_sys;

        let closure = Closure::wrap(Box::new(move |event: web_sys::KeyboardEvent| {
            if event.alt_key() && event.key().eq_ignore_ascii_case("t") {
                event.prevent_default();
                toggle();
            }
        }) as Box<dyn FnMut(_)>);
        let _ = web_sys::window().map(|window| {
            window
                .add_event_listener_with_callback("keydown", closure.as_ref().unchecked_ref())
                .map_err(|error| {
                    web_sys::console::warn_1(
                        &format!("Failed to register keydown listener on team deck: {error:?}")
                            .into(),
                    );
                })
        });
        closure.forget();
    });

    view! {
        <div class="team-deck">
            <span
                class="sr-only"
                aria-live="polite"
                aria-atomic="true"
            >
                {announcement}
            </span>
            <button
                type="button"
                class="team-deck-toggle tooltip tooltip-left"
                data-tip="Toggle team (Alt + T)"
                aria-expanded=move || expanded.get().to_string()
                aria-controls="team-deck-grid"
                on:click=move |_| toggle()
            >
                <span class="team-deck-label">"TEAM"</span>
            </button>
            <div
                id="team-deck-grid"
                class="team-deck-grid"
                class:team-deck-grid-open=move || expanded.get()
            >
                <Transition
                    fallback=move || {
                        view! { <span class="team-deck-status">"Loading team…"</span> }
                    }
                >
                    {move || {
                        members
                            .get()
                            .map(|list| {
                                if list.is_empty() {
                                    view! {
                                        <span class="team-deck-status">"No team members found."</span>
                                    }
                                        .into_any()
                                } else {
                                    view! {
                                        <ul class="avatar-group -space-x-2 rtl:space-x-reverse team-deck-group" role="list">
                                            {list
                                                .iter()
                                                .take(VISIBLE_AVATARS)
                                                .cloned()
                                                .map(|member| {
                                                    view! { <TeamMember member=member /> }
                                                })
                                                .collect::<Vec<_>>()}
                                            {move || {
                                                let remaining = list.len().saturating_sub(VISIBLE_AVATARS);
                                                if remaining > 0 {
                                                    view! {
                                                        <li class="team-deck-item" role="listitem">
                                                            <span
                                                                class="avatar avatar-placeholder team-deck-counter"
                                                                aria-label={format!("{remaining} more team members")}
                                                            >
                                                                <span class="text-xs">{format!("+{remaining}")}</span>
                                                            </span>
                                                        </li>
                                                    }
                                                        .into_any()
                                                } else {
                                                    view! {}.into_any()
                                                }
                                            }}
                                        </ul>
                                    }
                                        .into_any()
                                }
                            })
                    }}
                </Transition>
            </div>
        </div>
    }
}

/// A single team member entry rendered as an avatar linking to their GitHub
/// profile.
#[component]
#[must_use]
fn TeamMember(member: Member) -> impl IntoView {
    let alt = format!(
        "{login} — {role}",
        login = member.login,
        role = member.role.as_deref().unwrap_or("Member"),
    );

    view! {
        <li class="team-deck-item" role="listitem">
            <a
                href={member.html_url}
                target="_blank"
                rel="noopener noreferrer"
                class="avatar"
                aria-label={alt}
            >
                <div class="h-full aspect-square rounded-none">
                    <img
                        src={member.avatar_url}
                        alt={member.login}
                        class="w-full h-full object-cover"
                        loading="lazy"
                    />
                </div>
            </a>
        </li>
    }
}
