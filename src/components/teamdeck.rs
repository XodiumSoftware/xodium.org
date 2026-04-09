use crate::components::cornerframe::CornerFrame;
use crate::github::fetch_members;
use leptos::prelude::*;

#[component]
pub fn TeamDeckSection() -> impl IntoView {
    let (rotation, set_rotation) = signal(0usize);
    let (count, set_count) = signal(8usize); // Default to 8 positions
    let resource = LocalResource::new(|| async { fetch_members().await });

    view! {
        <section id="team" class="relative py-24 sm:py-32">
            <div class="team-deck-bg" />
            <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div class="team-deck-wrapper">
                    // Click zone at the right edge - triggers rotation
                    <div
                        class="deck-hover-zone"
                        on:click=move |_| {
                            let total = count.get();
                            if total > 0 {
                                set_rotation.set((rotation.get() + total - 1) % total);
                            }
                        }
                    />
                    <ul class="team-deck">
                        <Suspense fallback=|| view! {
                            <li class="team-deck-card team-deck-title">
                                "Loading..."
                            </li>
                        }>
                            {move || {
                                resource
                                    .get()
                                    .map(|members| {
                                        let members = members.unwrap_or_default();
                                        let member_count = members.len();
                                        let total_count = member_count + 1; // +1 for title card
                                        set_count.set(total_count.max(2));

                                        members
                                            .into_iter()
                                            .enumerate()
                                            .map(|(idx, member)| {
                                                let card_idx = idx + 1; // Offset by 1 for title card
                                                view! {
                                                    <li
                                                        class="team-deck-card"
                                                        data-deck-pos=move || {
                                                            let total = count.get();
                                                            (card_idx + rotation.get()) % total
                                                        }
                                                    >
                                                        <a
                                                            href=member.html_url
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            class="group flex flex-col items-center justify-center h-full w-full bg-ghost hover:border-primary hover:text-primary border-2 border-base-content/80 p-2"
                                                        >
                                                            <CornerFrame
                                                                style="square"
                                                                class="h-full w-full flex flex-col items-center justify-center"
                                                            >
                                                                <div class="avatar mb-4">
                                                                    <div class="w-20 rounded-full">
                                                                        <img
                                                                            src=member.avatar_url
                                                                            alt=member.login.clone()
                                                                            loading="lazy"
                                                                            decoding="async"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <span class="font-medium text-lg">
                                                                    {member.login}
                                                                </span>
                                                            </CornerFrame>
                                                        </a>
                                                    </li>
                                                }
                                            })
                                            .collect_view()
                                    })
                            }}
                        </Suspense>
                        // Title card (always present, rotates through positions)
                        <li
                            class="team-deck-card team-deck-title"
                            data-deck-pos=move || {
                                let total = count.get();
                                rotation.get() % total
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
