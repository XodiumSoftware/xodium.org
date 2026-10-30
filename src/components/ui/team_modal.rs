use crate::components::ui::team_avatars::TeamAvatars;
use leptos::prelude::*;

/// Modal overlay that introduces the Xodium team.
///
/// Triggered from the 3D scene by clicking the dedicated "Team" block. The
/// dialog is centered on screen, can be closed with the Escape key, by
/// clicking the backdrop, or by activating the close button.
#[component]
#[must_use]
pub fn TeamModal(
    /// Reactive flag controlling visibility. Set to `true` to open the modal.
    open: RwSignal<bool>,
) -> impl IntoView {
    let close = move || open.set(false);

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
                    <TeamAvatars />
                </div>
            </div>
        </div>
    }
}
