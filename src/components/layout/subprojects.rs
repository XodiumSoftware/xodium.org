//! Subprojects band below the hero.

use crate::components::ui::spotlight::{SPOTLIGHT_SURFACE, Spotlight};
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
        title: "mine-in-abyss",
        desc: "The recreation of 'Made In Abyss' into Minecraft.",
        href: "https://github.com/XodiumSoftware/mine-in-abyss",
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

/// Equal-width subproject cards, below the hero.
#[component]
#[must_use]
pub fn Subprojects() -> impl IntoView {
    view! {
        <section
            class="sheet-band grid h-24 grid-cols-1 overflow-hidden max-md:h-auto max-md:overflow-visible md:grid-cols-3 md:divide-x md:divide-base-content/40"
            aria-label="Subprojects"
        >
            {SUBPROJECT_ITEMS
                .iter()
                .map(|item| {
                    view! {
                        <a
                            class=format!(
                                "group {SPOTLIGHT_SURFACE} flex flex-col justify-center gap-2 px-6 py-4 hover:bg-base-content/5",
                            )
                            href=item.href
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Spotlight />
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
                                    class="opacity-60 group-hover:opacity-100 group-hover:text-primary"
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
