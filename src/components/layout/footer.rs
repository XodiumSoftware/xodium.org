//! Site footer: one line of monospace text closing the sheet, including the
//! toggle that swaps the band below the hero.

use crate::components::layout::main::{LowerBand, LowerBandState, SheetEntrance};
use crate::ui::{BuyMeACoffeeIcon, GitHubIcon};
use leptos::prelude::*;

/// A single link rendered in the blueprint footer.
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
    /// Accessible name, since the icon itself is decorative.
    aria_label: &'static str,
    /// Renders the link's icon.
    icon: fn() -> AnyView,
}

/// Footer links shown after the band toggle, in reading order.
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
];

/// Icon-only links closing the footer, after [`FOOTER_LINKS`].
const FOOTER_ICON_LINKS: &[FooterIconLink] = &[
    FooterIconLink {
        href: "https://github.com/XodiumSoftware",
        aria_label: "Xodium Software on GitHub",
        icon: || view! { <GitHubIcon /> }.into_any(),
    },
    FooterIconLink {
        href: "https://buymeacoffee.com/illyrius",
        aria_label: "Buy me a coffee",
        icon: || view! { <BuyMeACoffeeIcon /> }.into_any(),
    },
];

/// Blueprint footer: one line of margin notes closing the sheet, in flow rather
/// than pinned to the viewport.
///
/// The toggle is a `<button>` with `aria-pressed`, not a link: it changes state
/// and cannot navigate. It is labelled with the band that is *not* currently
/// shown, so it names the destination. The icon links carry their own accessible
/// names, since the icons are decorative.
///
/// Takes the load-in entrance only: it is never swapped, so it carries no swap
/// class.
#[component]
#[must_use]
pub fn Footer() -> impl IntoView {
    let lower_band = LowerBandState::use_context();
    let entrance = SheetEntrance::use_context();

    view! {
        <footer
            class=move || {
                format!(
                    "sheet-band-footer {} flex flex-wrap items-baseline justify-center gap-2 py-6 font-mono text-[0.65rem] uppercase tracking-[0.08em] text-base-content opacity-75 max-sm:text-[0.55rem] max-[700px]:gap-1.5 max-[700px]:text-[0.5rem]",
                    entrance.band_class(),
                )
            }
            aria-label="Site footer"
        >
            <span>"XODIUM™"</span>
            <span class="opacity-50 select-none" aria-hidden="true">
                "·"
            </span>
            <button
                type="button"
                class="cursor-pointer border-0 bg-none p-0 font-[inherit] tracking-[inherit] text-current uppercase underline underline-offset-[3px] transition-colors select-none hover:text-primary"
                aria-pressed=move || (lower_band.get() == LowerBand::Team).to_string()
                on:click=move |_| lower_band.toggle()
            >
                {move || match lower_band.get() {
                    LowerBand::Subprojects => "TEAM",
                    LowerBand::Team => "SUBPROJECTS",
                }}
            </button>
            {FOOTER_LINKS
                .iter()
                .map(|link| {
                    view! {
                        <span class="opacity-50 select-none" aria-hidden="true">
                            "·"
                        </span>
                        <a
                            class="font-[inherit] tracking-[inherit] text-current uppercase underline underline-offset-[3px] transition-colors select-none hover:text-primary"
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
                            class="inline-flex items-center self-center text-current no-underline transition-colors select-none hover:text-primary [&>svg]:h-[0.8rem] [&>svg]:w-auto"
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
