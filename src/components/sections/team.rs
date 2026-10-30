use crate::components::ui::avatar::Avatar;
use crate::github::fetch_members;
use leptos::prelude::*;

/// Maximum number of avatars displayed before collapsing the rest into a
/// "+N" counter.
const VISIBLE_AVATARS: usize = 4;

/// Modal overlay that introduces the Xodium team.
///
/// Triggered from the 3D scene by clicking the dedicated "Team" block. The
/// dialog is centered on screen, can be closed with the Escape key, by
/// clicking the backdrop, or by activating the close button. The avatar list
/// is fetched inline from the GitHub API.
#[component]
#[must_use]
pub fn Team(
    /// Reactive flag controlling visibility. Set to `true` to open the modal.
    open: RwSignal<bool>,
) -> impl IntoView {
    let close = move || open.set(false);
    let members =
        LocalResource::new(move || async move { fetch_members().await.unwrap_or_default() });

    view! {
        <div
            class="team-modal-backdrop"
            class:hidden=move || !open.get()
            aria-hidden=move || !open.get()
            on:click=move |_| close()
        >
            <div
                class="team-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="team-modal-title"
                on:click=move |ev| ev.stop_propagation()
                on:keydown=move |ev| {
                    if ev.key() == "Escape" {
                        close();
                    }
                }
            >
                <button
                    class="team-modal-close"
                    type="button"
                    aria-label="Close team dialog"
                    on:click=move |_| close()
                >
                    "×"
                </button>

                <h2 id="team-modal-title" class="team-modal-title">
                    "The people behind Xodium"
                </h2>

                <div class="team-modal-content">
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
                                            <span class="team-avatars-status">
                                                "No team members found."
                                            </span>
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
                                                        view! { <Avatar member=member /> }
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
                </div>
            </div>
        </div>
    }
}
