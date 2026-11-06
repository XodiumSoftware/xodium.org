//! Three-button band below the hero.
//!
//! The buttons share equal width and are separated by vertical rules so the row
//! reads as three drafted cells rather than flowing text.

use leptos::prelude::*;

/// A single card in the [`TriColumn`] band.
#[derive(Clone)]
#[must_use]
pub struct TriColumnItem {
    /// Card heading, rendered as an `h2`.
    pub title: &'static str,
    /// Short description shown beneath the heading.
    pub desc: &'static str,
    /// Destination URL opened in a new tab.
    pub href: &'static str,
}

/// Cards rendered by [`TriColumn`], in reading order.
///
/// Placeholder copy and links until the real destinations are decided.
const TRI_COLUMN_ITEMS: &[TriColumnItem] = &[
    TriColumnItem {
        title: "Placeholder 1",
        desc: "Placeholder description 1.",
        href: "#",
    },
    TriColumnItem {
        title: "Placeholder 2",
        desc: "Placeholder description 2.",
        href: "#",
    },
    TriColumnItem {
        title: "Placeholder 3",
        desc: "Placeholder description 3.",
        href: "#",
    },
];

/// Equal-width three-button region below the hero.
///
/// Each card is a single anchor so the whole cell is clickable, and stacks to a
/// single column on narrow viewports.
#[component]
#[must_use]
pub fn TriColumn() -> impl IntoView {
    view! {
        <section
            class="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-base-content/40 py-8 border-b border-base-content/40"
            aria-label="Featured links"
        >
            {TRI_COLUMN_ITEMS
                .iter()
                .map(|item| {
                    view! {
                        <a
                            class="group flex flex-col gap-2 px-6 py-4 md:first:pl-0 md:last:pr-0 transition-colors hover:bg-base-content/5"
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
