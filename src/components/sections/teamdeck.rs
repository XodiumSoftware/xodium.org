use crate::components::cards::teamcard::{TeamCard, TeamCardProperties};
use crate::components::ui::cornerframe::CornerFrame;
use crate::components::ui::datagrid::data_grid;
use crate::github::{Member, fetch_members};
use leptos::prelude::*;

#[component]
pub fn TeamDeckSection() -> impl IntoView {
    let (rotation, set_rotation) = signal(0usize);
    let (count, set_count) = signal(8usize);
    let (retry_count, set_retry_count) = signal(0u32);

    let resource = LocalResource::new(move || {
        let _ = retry_count.get();
        async move { fetch_members().await }
    });

    let retry = move || {
        set_retry_count.update(|n| *n += 1);
    };

    let rotate = move || {
        let total = count.get();
        if total > 0 {
            set_rotation.set((rotation.get() + total - 1) % total);
        }
    };

    view! {
        <section id="team" class="relative py-24 sm:py-32">
            <div class="team-deck-bg" />
            <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div class="team-deck-wrapper">
                    // Click zone at the right edge - triggers rotation
                    <div
                        class="deck-hover-zone"
                        tabindex="0"
                        role="button"
                        aria-label="Rotate team deck"
                        on:click=move |_| rotate()
                        on:keydown=move |ev| {
                            if ev.key() == "Enter" || ev.key() == " " {
                                ev.prevent_default();
                                rotate();
                            }
                        }
                    />
                    <ul class="team-deck">
                        {data_grid(
                            resource,
                            "No team members found.",
                            move |members: Vec<Member>| {
                                let member_count = members.len();
                                let total_count = member_count + 1;
                                set_count.set(total_count.max(2));

                                members
                                    .into_iter()
                                    .enumerate()
                                    .map(|(idx, member)| {
                                        let card_idx = idx + 1;
                                        view! {
                                            <li
                                                class="team-deck-card"
                                                data-deck-pos=move || {
                                                    let total = count.get();
                                                    (card_idx + rotation.get()) % total
                                                }
                                            >
                                                <TeamCard props=TeamCardProperties {
                                                    login: member.login,
                                                    html_url: member.html_url,
                                                    avatar_url: member.avatar_url,
                                                    role: member.role,
                                                } />
                                            </li>
                                        }
                                    })
                                    .collect_view()
                            },
                            Some(retry),
                        )}
                        // Title card (always present, rotates through positions)
                        <li
                            class="team-deck-card team-deck-title"
                            tabindex="0"
                            role="button"
                            aria-label="Rotate team deck"
                            data-deck-pos=move || {
                                let total = count.get();
                                rotation.get() % total
                            }
                            on:click=move |_| rotate()
                            on:keydown=move |ev| {
                                if ev.key() == "Enter" || ev.key() == " " {
                                    ev.prevent_default();
                                    rotate();
                                }
                            }
                        >
                            <div class="h-full w-full p-2">
                                <CornerFrame
                                    style="square"
                                    black=true
                                    class="h-full w-full flex items-center justify-center"
                                >
                                    <h2 class="text-3xl font-bold tracking-tight text-transparent bg-base-100 bg-clip-text whitespace-nowrap">
                                        "THE TEAM"
                                    </h2>
                                </CornerFrame>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    }
}
