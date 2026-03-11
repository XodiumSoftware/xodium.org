use js_sys::Function;
use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;
use leptos::wasm_bindgen::closure::Closure;
use leptos::web_sys;

struct SocialLink {
    href: &'static str,
    label: &'static str,
    is_external: bool,
    icon_path: &'static str,
    hover_color: &'static str,
}

const SOCIAL_LINKS: &[SocialLink] = &[
    SocialLink {
        href: "https://wiki.xodium.org",
        label: "Wiki",
        is_external: true,
        icon_path: "/icons/wiki.svg",
        hover_color: "group-hover:bg-primary",
    },
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
    let (is_scrolled, set_is_scrolled) = signal(false);

    Effect::new(move |_| {
        let window = web_sys::window().unwrap();
        let closure = Closure::wrap(Box::new(move |_ev: web_sys::Event| {
            set_is_scrolled.set(web_sys::window().unwrap().scroll_y().unwrap_or(0.0) > 0.0);
        }) as Box<dyn FnMut(_)>);
        let fn_ref: Function = closure.as_ref().unchecked_ref::<Function>().clone();
        window
            .add_event_listener_with_callback("scroll", &fn_ref)
            .unwrap();
        on_cleanup(move || {
            web_sys::window()
                .unwrap()
                .remove_event_listener_with_callback("scroll", &fn_ref)
                .unwrap();
        });
        closure.forget();
    });

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
                    <a href="#" class="p-0">
                        <img src="/icons/favicon.svg" alt="Xodium Icon" class="h-12 w-12" />
                    </a>
                    <a href="#projects" class="hover:text-primary text-sm font-semibold lift">
                        "PROJECTS"
                    </a>
                    <a href="#team" class="hover:text-primary text-sm font-semibold lift">
                        "TEAM"
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
