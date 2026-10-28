use leptos::prelude::*;

use crate::github::{Member, fetch_members};

/// Maximum number of avatars displayed before collapsing the rest into a
/// "+N" counter.
const VISIBLE_AVATARS: usize = 4;

/// A DaisyUI `avatar-group` of GitHub team members.
///
/// Fetches public members of the `XodiumSoftware` organization and renders
/// their avatars as a compact horizontal stack, with a "+N" placeholder when
/// the team is larger than `VISIBLE_AVATARS`.
#[component]
#[must_use]
pub fn TeamAvatars() -> impl IntoView {
    let members =
        LocalResource::new(move || async move { fetch_members().await.unwrap_or_default() });

    view! {
        <Transition
            fallback=move || {
                view! { <span class="team-avatars-status">"Loading team…"</span> }
            }
        >
            {move || {
                members
                    .get()
                    .map(|list| {
                        if list.is_empty() {
                            view! {
                                <span class="team-avatars-status">"No team members found."</span>
                            }
                                .into_any()
                        } else {
                            view! {
                                <ul
                                    class="avatar-group -space-x-2 rtl:space-x-reverse team-avatars-group"
                                    role="list"
                                    aria-label="Xodium team members"
                                >
                                    {list
                                        .iter()
                                        .take(VISIBLE_AVATARS)
                                        .cloned()
                                        .map(|member| {
                                            view! { <TeamAvatar member=member /> }
                                        })
                                        .collect::<Vec<_>>()}
                                    {move || {
                                        let remaining = list.len().saturating_sub(VISIBLE_AVATARS);
                                        (remaining > 0).then(|| {
                                            view! {
                                                <li class="team-avatars-item" role="listitem">
                                                    <span
                                                        class="avatar avatar-placeholder team-avatars-counter"
                                                        aria-label={format!("{remaining} more team members")}
                                                    >
                                                        <span class="text-xs">{format!("+{remaining}")}</span>
                                                    </span>
                                                </li>
                                            }
                                                .into_any()
                                        })
                                    }}
                                </ul>
                            }
                                .into_any()
                        }
                    })
            }}
        </Transition>
    }
}

/// A single team member avatar linking to their GitHub profile.
#[component]
#[must_use]
fn TeamAvatar(member: Member) -> impl IntoView {
    let alt = format!(
        "{login} — {role}",
        login = member.login,
        role = member.role.as_deref().unwrap_or("Member"),
    );

    view! {
        <li class="team-avatars-item" role="listitem">
            <a
                href={member.html_url}
                target="_blank"
                rel="noopener noreferrer"
                class="avatar"
                aria-label={alt}
            >
                <div class="h-10 w-10 rounded-none">
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
