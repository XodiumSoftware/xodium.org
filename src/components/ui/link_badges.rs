use leptos::prelude::*;

use crate::ui::{BuyMeACoffeeIcon, GitHubIcon};

/// Function pointer that renders an icon as a type-erased view.
type IconRenderer = fn() -> AnyView;

/// Metadata for an external link badge.
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

/// External links displayed beside the title block.
const LINK_BADGES: &[LinkBadge] = &[
    LinkBadge {
        href: "https://github.com/XodiumSoftware",
        aria_label: "Xodium Software on GitHub",
        tooltip: "GitHub",
        icon: || view! { <GitHubIcon /> }.into_any(),
    },
    LinkBadge {
        href: "https://buymeacoffee.com/illyrius",
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
#[component]
#[must_use]
pub fn LinkBadges() -> impl IntoView {
    view! {
        <nav aria-label="External links" class="link-badges">
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
