use leptos::prelude::*;
use leptos::wasm_bindgen::JsCast;

use crate::ui::{BuyMeACoffeeIcon, GitHubIcon};
use crate::utils::CADIOTHEKA_URL;

/// Function pointer that renders an icon as a type-erased view.
type IconRenderer = fn() -> AnyView;

/// Metadata for an external link badge in the corner stack.
struct LinkBadge {
    /// Destination URL opened by the badge.
    href: &'static str,
    /// Accessible name announced by assistive technology.
    aria_label: &'static str,
    /// Tooltip text displayed on hover.
    tooltip: &'static str,
    /// Component that renders the badge icon.
    icon: IconRenderer,
}

/// URL opened by the GitHub badge and the `Alt + G` keyboard shortcut.
const GITHUB_URL: &str = "https://github.com/XodiumSoftware";

/// URL opened by the Buy Me a Coffee badge and the `Alt + C` keyboard shortcut.
const BMC_URL: &str = "https://buymeacoffee.com/illyrius";

/// External links displayed beside the title block.
const LINK_BADGES: &[LinkBadge] = &[
    LinkBadge {
        href: GITHUB_URL,
        aria_label: "Xodium Software on GitHub",
        tooltip: "GitHub",
        icon: || view! { <GitHubIcon /> }.into_any(),
    },
    LinkBadge {
        href: BMC_URL,
        aria_label: "Buy me a coffee",
        tooltip: "Buy Me a Coffee",
        icon: || view! { <BuyMeACoffeeIcon /> }.into_any(),
    },
];

/// Small two-row badge block displayed immediately to the left of the title
/// block.
///
/// Both icons are inlined so they render without fetching static assets and
/// can inherit hover colours through `currentColor`. The Buy Me a Coffee cup
/// retains its brand-yellow body.
///
/// The navigation contains direct anchor children so flexbox can stretch the
/// badge cells to match the height of the adjacent title block.
///
/// Pressing `Alt + 1` opens Cadiotheka, `Alt + G` opens GitHub, and
/// `Alt + C` opens Buy Me a Coffee so keyboard users can reach any of these
/// links quickly without tabbing through the badge row.
#[component]
#[must_use]
pub fn LinkBadges() -> impl IntoView {
    let (announcement, set_announcement) = signal(String::new());

    Effect::new(move |_| {
        use leptos::wasm_bindgen::closure::Closure;
        use leptos::web_sys;

        let boxed: Box<dyn FnMut(web_sys::KeyboardEvent)> =
            Box::new(move |event: web_sys::KeyboardEvent| {
                if !event.alt_key() {
                    return;
                }

                let (url, label) = match event.key().to_ascii_lowercase().as_str() {
                    "1" => (CADIOTHEKA_URL, "Cadiotheka"),
                    "g" => (GITHUB_URL, "GitHub"),
                    "c" => (BMC_URL, "Buy Me a Coffee"),
                    _ => return,
                };

                event.prevent_default();
                if let Some(window) = web_sys::window() {
                    if let Err(error) = window.open_with_url_and_target(url, "_blank") {
                        web_sys::console::warn_1(
                            &format!("Failed to open {label} from keyboard shortcut: {error:?}")
                                .into(),
                        );
                    }
                } else {
                    web_sys::console::warn_1(
                        &format!(
                            "No browser window available to open {label} from keyboard shortcut."
                        )
                        .into(),
                    );
                }
                set_announcement(format!("Opened {label} in a new tab."));
            });
        let closure = Closure::wrap(boxed);

        if let Some(window) = web_sys::window()
            && let Err(error) =
                window.add_event_listener_with_callback("keydown", closure.as_ref().unchecked_ref())
        {
            web_sys::console::warn_1(
                &format!("Failed to register keydown listener on link badges: {error:?}").into(),
            );
        }
        closure.forget();
    });

    view! {
        <nav aria-label="External links" class="link-badges">
            <span
                id="github-shortcut-announcement"
                class="sr-only"
                aria-live="polite"
                aria-atomic="true"
            >
                {announcement}
            </span>
            {LINK_BADGES
                .iter()
                .map(|badge| {
                    let icon = (badge.icon)();

                    view! {
                        <a
                            href={badge.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={badge.aria_label}
                            class="link-badge-cell tooltip tooltip-left"
                            data-tip={badge.tooltip}
                        >
                            {icon}
                        </a>
                    }
                })
                .collect::<Vec<_>>()}
        </nav>
    }
}
