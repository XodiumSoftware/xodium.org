use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;
use leptos::wasm_bindgen::closure::Closure;
use leptos::web_sys;

#[derive(Clone)]
struct SocialLink {
    href: &'static str,
    label: &'static str,
    is_external: bool,
    icon_path: &'static str,
}

#[component]
pub fn Header() -> impl IntoView {
    let (is_scrolled, set_is_scrolled) = signal(false);

    let _scroll_listener = Effect::new(move |_| {
        let cb = move |_ev: web_sys::Event| {
            set_is_scrolled.set(web_sys::window().unwrap().scroll_y().unwrap_or(0.0) > 0.0);
        };
        let window = web_sys::window().unwrap();
        let closure = Closure::wrap(Box::new(cb) as Box<dyn FnMut(_)>);
        window
            .add_event_listener_with_callback("scroll", closure.as_ref().unchecked_ref())
            .unwrap();
        closure.forget();
    });

    let social_links = vec![
        SocialLink {
            href: "https://wiki.xodium.org",
            label: "Wiki",
            is_external: true,
            icon_path: "/icons/wiki.svg",
        },
        SocialLink {
            href: "https://github.com/XodiumSoftware",
            label: "Github",
            is_external: true,
            icon_path: "/icons/github.svg",
        },
    ];

    view! {
        <header
            id="top"
            class=move || {
                format!(
                    "z-20 relative sticky top-0 transition-all duration-300 {}",
                    if is_scrolled.get() {
                        "glass shadow-2xl shadow-black"
                    } else {
                        "bg-transparent"
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
                    <a href="#projects" class="hover:text-primary text-sm font-semibold">
                        "PROJECTS"
                    </a>
                    <a href="#team" class="hover:text-primary text-sm font-semibold">
                        "TEAM"
                    </a>
                </div>
                // Right side
                <div class="navbar-end">
                    <ul class="menu menu-horizontal gap-2">
                        {social_links
                            .into_iter()
                            .map(|link| {
                                view! {
                                    <li>
                                        <a
                                            class="hover:text-primary hover:bg-transparent"
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
                                            <img
                                                src=link.icon_path
                                                alt=link.label
                                                class="w-6 h-6"
                                                style="filter: invert(1);"
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
