use crate::i18n::*;
use crate::utils::{observe_intersections, window_event_listener};
use leptos::prelude::*;
use leptos::task::spawn_local;
use leptos::wasm_bindgen::JsCast;
use leptos::web_sys;
use std::time::Duration;

struct SocialLink {
    href: &'static str,
    label: &'static str,
    is_external: bool,
    icon_path: &'static str,
    hover_color: &'static str,
}

const SOCIAL_LINKS: &[SocialLink] = &[
    SocialLink {
        href: "https://github.com/XodiumSoftware",
        label: "Github",
        is_external: true,
        icon_path: "/icons/github.svg",
        hover_color: "group-hover:bg-primary",
    },
    SocialLink {
        href: "https://buymeacoffee.com/illyrius",
        label: "Sponsor",
        is_external: true,
        icon_path: "/icons/sponsor.svg",
        hover_color: "group-hover:bg-pink-500",
    },
];

#[component]
pub fn Header() -> impl IntoView {
    let i18n = use_i18n();
    let (is_scrolled, set_is_scrolled) = signal(false);
    let (active_section, set_active_section) = signal(String::new());
    let (is_logo_active, set_is_logo_active) = signal(false);

    // Scroll listener for backdrop blur
    Effect::new(move |_| {
        window_event_listener::<web_sys::Event, _>("scroll", move |_ev| {
            let scrolled = web_sys::window()
                .map(|w| w.scroll_y().unwrap_or(0.0) > 0.0)
                .unwrap_or(false);
            set_is_scrolled.set(scrolled);
        });
    });

    // IntersectionObserver to track which section is most visible
    Effect::new(move |_| {
        let Some(window) = web_sys::window() else {
            return;
        };
        let Some(document) = window.document() else {
            return;
        };

        let elements: Vec<web_sys::Element> = ["projects", "team"]
            .iter()
            .filter_map(|id| document.get_element_by_id(id))
            .collect();

        observe_intersections(&elements, 0.25, move |entries| {
            let best = entries
                .iter()
                .filter_map(|entry| {
                    let ratio = entry.intersection_ratio();
                    if ratio <= 0.0 {
                        return None;
                    }
                    let target = entry.target();
                    let target = target.dyn_ref::<web_sys::Element>()?;
                    let id = target.id();
                    if id.is_empty() {
                        return None;
                    }
                    Some((id, ratio))
                })
                .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

            if let Some((id, _)) = best {
                set_active_section.set(id);
            }
        });
    });

    let is_active = move |id: &str| active_section.get() == id;

    view! {
        <header
            id="top"
            class=move || {
                format!(
                    "z-20 relative sticky top-0 transition-all duration-300 border-b {}",
                    if is_scrolled.get() {
                        "backdrop-blur-md bg-base-100/50 border-white/10 shadow-2xl shadow-black"
                    } else {
                        "bg-transparent border-transparent"
                    },
                )
            }
        >
            <nav class="navbar max-w-7xl mx-auto">
                // Left side
                <div class="navbar-start gap-8">
                    <a
                        href="#"
                        class=move || {
                            format!("p-0 logo-container{}", if is_logo_active.get() { " logo-active" } else { "" })
                        }
                        on:click=move |ev: leptos::web_sys::MouseEvent| {
                            ev.prevent_default();
                            if let Some(window) = web_sys::window() {
                                window.scroll_to_with_x_and_y(0.0, 0.0);
                            }
                            if is_logo_active.get() {
                                return;
                            }
                            set_is_logo_active.set(true);
                            spawn_local(async move {
                                gloo_timers::future::sleep(Duration::from_millis(1500)).await;
                                set_is_logo_active.set(false);
                            });
                        }
                    >
                        <img
                            src="/icons/logo.svg"
                            alt="Xodium"
                            width="48"
                            height="48"
                            class="h-12 w-12"
                        />
                    </a>
                    <a
                        href="#projects"
                        class="hover:text-primary text-sm font-semibold lift"
                        aria-current=move || if is_active("projects") { Some("true") } else { None }
                    >
                        {t!(i18n, nav.projects)}
                    </a>
                    <a
                        href="#team"
                        class="hover:text-primary text-sm font-semibold lift"
                        aria-current=move || if is_active("team") { Some("true") } else { None }
                    >
                        {t!(i18n, nav.team)}
                    </a>
                </div>
                // Right side
                <div class="navbar-end">
                    <ul class="menu menu-horizontal gap-2">
                        {SOCIAL_LINKS
                            .iter()
                            .map(|link| {
                                view! {
                                    <li>
                                        <a
                                            class="group hover:bg-transparent lift rounded-none"
                                            href=link.href
                                            aria-label=link.label
                                            title=link.label
                                            target=if link.is_external { "_blank" } else { "" }
                                            rel=if link.is_external {
                                                "noopener noreferrer"
                                            } else {
                                                ""
                                            }
                                        >
                                            <span
                                                class=format!(
                                                    "nav-icon w-6 h-6 block bg-base-content {} transition-colors",
                                                    link.hover_color,
                                                )
                                                style=format!("--mask-url: url('{}')", link.icon_path)
                                            />
                                        </a>
                                    </li>
                                }
                            })
                            .collect::<Vec<_>>()}
                    </ul>
                </div>
            </nav>
        </header>
    }
}
