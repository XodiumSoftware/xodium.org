//! Site footer: the closing band of the sheet.

use crate::ui::{BuyMeACoffeeIcon, GitHubIcon};
use leptos::prelude::*;

/// A single text link in the footer.
struct FooterLink {
    /// Destination URL or mailto/path.
    href: &'static str,
    /// Uppercase label displayed in the footer.
    label: &'static str,
}

/// A footer entry rendered as an icon instead of a text label.
struct FooterIconLink {
    /// Destination URL opened in a new tab.
    href: &'static str,
    /// Accessible name for the icon-only link.
    aria_label: &'static str,
    /// Renders the link's icon.
    icon: fn() -> AnyView,
}

/// Footer links, in reading order.
const FOOTER_LINKS: &[FooterLink] = &[
    FooterLink {
        href: "https://github.com/XodiumSoftware",
        label: "ABOUT",
    },
    FooterLink {
        href: "https://www.gnu.org/licenses/agpl-3.0.html",
        label: "LICENSING",
    },
    FooterLink {
        href: "mailto:info@xodium.org",
        label: "CONTACT",
    },
    FooterLink {
        href: "https://github.com/orgs/XodiumSoftware/people",
        label: "TEAM",
    },
];

/// Icon-only links closing the footer, after [`FOOTER_LINKS`].
const FOOTER_ICON_LINKS: &[FooterIconLink] = &[
    FooterIconLink {
        href: "https://github.com/XodiumSoftware/xodium.org",
        aria_label: "Xodium Website on GitHub",
        icon: || view! { <GitHubIcon /> }.into_any(),
    },
    FooterIconLink {
        href: "https://buymeacoffee.com/illyrius",
        aria_label: "Buy me a coffee",
        icon: || view! { <BuyMeACoffeeIcon /> }.into_any(),
    },
];

/// Blueprint footer: the site's closing line of links.
#[component]
#[must_use]
pub fn Footer() -> impl IntoView {
    view! {
        <footer
            class="sheet-band flex flex-wrap items-baseline justify-center gap-2 py-6 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-base-content opacity-75 max-sm:text-[0.55rem] max-[700px]:gap-1.5 max-[700px]:text-[0.5rem]"
            aria-label="Site footer"
        >
            <span>"XODIUM™"</span>
            {FOOTER_LINKS
                .iter()
                .map(|link| {
                    view! {
                        <span class="opacity-50 select-none" aria-hidden="true">
                            "·"
                        </span>
                        <a
                            class="font-[inherit] tracking-[inherit] text-current uppercase underline underline-offset-[3px] select-none hover:text-primary"
                            href=link.href
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {link.label}
                        </a>
                    }
                })
                .collect::<Vec<_>>()}
            {FOOTER_ICON_LINKS
                .iter()
                .map(|link| {
                    view! {
                        <span class="opacity-50 select-none" aria-hidden="true">
                            "·"
                        </span>
                        <a
                            class="inline-flex items-center self-center text-current no-underline select-none hover:text-primary [&>svg]:h-[0.8rem] [&>svg]:w-auto"
                            href=link.href
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label=link.aria_label
                        >
                            {(link.icon)()}
                        </a>
                    }
                })
                .collect::<Vec<_>>()}
        </footer>
    }
}
