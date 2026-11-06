//! Site footer.
//!
//! A single line of monospace uppercase text closing the drawing sheet. The
//! first entry toggles the band below the hero between the subprojects cards
//! and the team, so the sheet never stacks a fourth band.

use crate::components::layout::main::{LowerBand, LowerBandState};
use leptos::prelude::*;

/// A single link rendered in the blueprint footer.
struct FooterLink {
    /// Destination URL or mailto/path.
    href: &'static str,
    /// Uppercase label displayed in the footer.
    label: &'static str,
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

/// Blueprint footer — a single line of monospace uppercase text closing the
/// drawing sheet, reading like a handwritten note in the margin rather than a
/// framed cell. It flows with the sheet's content instead of being pinned to
/// the viewport.
///
/// The leading entry is a button, not a link: it names the band that is *not*
/// currently in the lower slot, and pressing it swaps the two. It carries
/// `aria-pressed` so assistive tech treats it as a state toggle rather than a
/// navigation link that goes nowhere.
#[component]
#[must_use]
pub fn Footer() -> impl IntoView {
    let current_year = js_sys::Date::new_0().get_full_year();
    let lower_band = LowerBandState::use_context();

    view! {
        <footer class="blueprint-footer" aria-label="Site footer">
            <span>{format!("© {current_year} XODIUM™")}</span>
            <span class="blueprint-footer-sep" aria-hidden="true">"·"</span>
            <button
                type="button"
                class="blueprint-footer-action"
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
                        <span class="blueprint-footer-sep" aria-hidden="true">"·"</span>
                        <a
                            href=link.href
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {link.label}
                        </a>
                    }
                })
                .collect::<Vec<_>>()}
        </footer>
    }
}
