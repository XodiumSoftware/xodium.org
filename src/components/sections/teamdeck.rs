use crate::components::cards::teamcard::{TeamCard, TeamCardProperties};
use crate::components::ui::cornerframe::CornerFrame;
use crate::components::ui::datagrid::data_grid;
use crate::github::{Member, fetch_members};
use crate::i18n::*;
use crate::utils::SendWrapper;
use js_sys::Function;
use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;
use leptos::wasm_bindgen::closure::Closure;
use leptos::web_sys;

#[component]
pub fn TeamDeckSection() -> impl IntoView {
    let i18n = use_i18n();
    let (rotation, set_rotation) = signal(0usize);
    let (count, set_count) = signal(8usize);
    let (retry_count, set_retry_count) = signal(0u32);
    let (is_visible, set_is_visible) = signal(false);

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

    // Track when the team section is visible so keyboard shortcuts work on scroll
    Effect::new(move |_| {
        let Some(window) = web_sys::window() else {
            return;
        };
        let Some(document) = window.document() else {
            return;
        };
        let Some(section) = document.get_element_by_id("team") else {
            return;
        };

        let closure = SendWrapper(Closure::wrap(Box::new(move |entries: js_sys::Array| {
            for entry in entries.iter() {
                if let Ok(entry) = entry.dyn_into::<web_sys::IntersectionObserverEntry>() {
                    set_is_visible.set(entry.is_intersecting());
                }
            }
        }) as Box<dyn FnMut(_)>));

        let options = web_sys::IntersectionObserverInit::new();
        options.set_threshold(&js_sys::Array::of1(&js_sys::Number::from(0.5)));

        let Ok(observer) = web_sys::IntersectionObserver::new_with_options(
            closure.0.as_ref().unchecked_ref(),
            &options,
        ) else {
            return;
        };

        observer.observe(&section);

        on_cleanup(move || {
            observer.disconnect();
            drop(closure);
        });
    });

    // Global keydown listener that fires when the team section is in view
    Effect::new(move |_| {
        let Some(window) = web_sys::window() else {
            return;
        };
        let rotate = rotate;
        let is_visible = is_visible;

        let closure = SendWrapper(Closure::wrap(Box::new(move |ev: web_sys::KeyboardEvent| {
            if (ev.key() == "Enter" || ev.key() == " ") && is_visible.get() {
                ev.prevent_default();
                rotate();
            }
        }) as Box<dyn FnMut(_)>));

        let fn_ref: Function = closure.0.as_ref().unchecked_ref::<Function>().clone();
        window
            .add_event_listener_with_callback("keydown", &fn_ref)
            .expect("should be able to add keydown listener");

        on_cleanup(move || {
            if let Some(window) = web_sys::window() {
                let _ = window.remove_event_listener_with_callback("keydown", &fn_ref);
            }
            drop(closure);
        });
    });

    view! {
        <section id="team" class="relative py-24 sm:py-32">
            <div class="team-deck-bg" />
            <div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div
                    class="team-deck-wrapper"
                    tabindex="0"
                    role="region"
                    aria-label=t_string!(i18n, team.deck_label)
                >
                    // Click zone at the right edge - triggers rotation
                    <div
                        class="deck-hover-zone"
                        role="button"
                        aria-label=t_string!(i18n, team.rotate_label)
                        on:click=move |_| rotate()
                    />
                    <ul class="team-deck">
                        {data_grid(
                            resource,
                            move || t_string!(i18n, team.empty),
                            move |members: Vec<Member>| {
                                let member_count = members.len();
                                let total_count = member_count + 1;
                                set_count.set(total_count.max(2));

                                members
                                    .into_iter()
                                    .enumerate()
                                    .map(|(idx, member)| {
                                        let card_idx = idx + 1;
                                        let login = member.login.clone();
                                        view! {
                                            <li
                                                class="team-deck-card"
                                                tabindex="0"
                                                role="button"
                                                aria-label=format!("{} - {}", login, t_string!(i18n, team.rotate_label))
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
                            aria-label=t_string!(i18n, team.rotate_label)
                            data-deck-pos=move || {
                                let total = count.get();
                                rotation.get() % total
                            }
                            on:click=move |_| rotate()
                        >
                            <div class="h-full w-full p-2">
                                <CornerFrame
                                    style="square"
                                    black=true
                                    class="h-full w-full flex items-center justify-center"
                                >
                                    <h2 class="text-3xl font-bold tracking-tight text-transparent bg-base-100 bg-clip-text whitespace-nowrap">
                                        {t!(i18n, team.title)}
                                    </h2>
                                </CornerFrame>
                            </div>
                        </li>
                    </ul>
                </div>
                // Keyboard hint below the deck
                <div class="mt-6 hidden md:flex items-center justify-center gap-2 text-sm text-base-content/50 font-mono select-none">
                    <span>{t!(i18n, team.keyboard_hint_press)}</span>
                    <kbd class="inline-flex items-center justify-center px-2 py-0.5 min-w-[1.5rem] rounded border border-base-content/20 bg-base-200 shadow-[0_2px_0_0_rgba(0,0,0,0.3)] text-xs font-sans">{t!(i18n, team.keyboard_hint_space)}</kbd>
                    <span>{t!(i18n, team.keyboard_hint_or)}</span>
                    <kbd class="inline-flex items-center justify-center px-2 py-0.5 min-w-[1.5rem] rounded border border-base-content/20 bg-base-200 shadow-[0_2px_0_0_rgba(0,0,0,0.3)] text-xs font-sans">{t!(i18n, team.keyboard_hint_enter)}</kbd>
                    <span>{t!(i18n, team.keyboard_hint_to_rotate)}</span>
                </div>
            </div>
        </section>
    }
}
