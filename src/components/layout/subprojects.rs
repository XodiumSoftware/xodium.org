//! Subprojects band below the hero.
//!
//! The cards share equal width and are separated by vertical rules so the row
//! reads as three drafted cells rather than flowing text.

use crate::components::layout::main::SheetEntrance;
use leptos::prelude::*;

/// A single card in the [`Subprojects`] band.
#[derive(Clone)]
#[must_use]
pub struct SubprojectItem {
    /// Card heading, rendered as an `h2`.
    pub title: &'static str,
    /// Short description shown beneath the heading.
    pub desc: &'static str,
    /// Destination URL opened in a new tab.
    pub href: &'static str,
}

/// Cards rendered by [`Subprojects`], in reading order.
const SUBPROJECT_ITEMS: &[SubprojectItem] = &[
    SubprojectItem {
        title: "zed-kotlin-ext",
        desc: "Zed IDE Kotlin support.",
        href: "https://github.com/XodiumSoftware/zed-kotlin-ext",
    },
    SubprojectItem {
        title: "msi-coolerboost",
        desc: "Noctalia bar widget for MSI laptop fan boost.",
        href: "https://github.com/XodiumSoftware/msi-coolerboost",
    },
    SubprojectItem {
        title: "pumpkinplus",
        desc: "Minecraft Pumpkin plugin that enhances the base gameplay.",
        href: "https://github.com/XodiumSoftware/pumpkinplus",
    },
];

/// Equal-width three-card subprojects region below the hero.
///
/// Each card is a single anchor so the whole cell is clickable, and stacks to a
/// single column on narrow viewports.
///
/// This band shares the lower slot with [`Team`](crate::components::layout::team::Team), so it takes its entrance from
/// [`SheetEntrance`] rather than a static class: it animates on first paint and
/// crossfades in when the footer swaps back to it.
#[component]
#[must_use]
pub fn Subprojects() -> impl IntoView {
    let entrance = SheetEntrance::use_context();

    view! {
        <section
            class=move || {
                format!(
                    "sheet-band sheet-band-subprojects {} {} grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-base-content/40 border-b border-base-content/40",
                    entrance.band_class(),
                    entrance.swap_class(),
                )
            }
            aria-label="Subprojects"
        >
            {SUBPROJECT_ITEMS
                .iter()
                .map(|item| {
                    view! {
                        <a
                            class="group flex flex-col justify-center gap-2 px-6 py-(--lower-band-padding-y) transition-colors hover:bg-base-content/5"
                            href=item.href
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <h2 class="flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.08em]">
                                {item.title}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="opacity-60 group-hover:opacity-100 group-hover:text-primary group-hover:-translate-y-0.5 transition-[transform,color,opacity]"
                                    aria-hidden="true"
                                >
                                    <path d="M7 7h10v10"></path>
                                    <path d="M7 17 17 7"></path>
                                </svg>
                            </h2>
                            <p class="text-xs leading-relaxed text-base-content/70">
                                {item.desc}
                            </p>
                        </a>
                    }
                })
                .collect_view()}
        </section>
    }
}
