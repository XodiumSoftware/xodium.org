use leptos::prelude::*;

/// Small two-cell badge block that sits immediately to the left of the title
/// block, in the same style: a thin-bordered table cell for GitHub and one
/// for Buy Me a Coffee.
///
/// GitHub SVG comes from `public/icons/github.svg` (already shipped). The
/// coffee cup SVG is inlined so the button doesn't depend on a new static
/// asset.
#[component]
#[must_use]
pub fn LinkBadges() -> impl IntoView {
    view! {
        <table aria-label="External links" class="link-badges">
            <tbody>
                <tr>
                    <td class="link-badge-cell">
                        <a
                            href="https://github.com/XodiumSoftware"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Xodium Software on GitHub"
                            class="link-badge-link"
                        >
                            <img src="/icons/github.svg" alt="" class="link-badge-icon" />
                        </a>
                    </td>
                    <td class="link-badge-cell">
                        <a
                            href="https://buymeacoffee.com/illyrius"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Buy me a coffee"
                            class="link-badge-link"
                        >
                            // Simplified Buy Me a Coffee cup mark (the foam / steam /
                            // letterboxing from the canonical logo are dropped so the
                            // glyph reads as line work on the blueprint).
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                class="link-badge-icon"
                                role="img"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4 9h13v6.5A4.5 4.5 0 0 1 12.5 20h-4A4.5 4.5 0 0 1 4 15.5V9Z"
                                    stroke="currentColor"
                                    stroke-width="1.6"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"
                                    stroke="currentColor"
                                    stroke-width="1.6"
                                />
                                <path
                                    d="M8 4c0 1.2-1 1.6-1 3M11.5 4c0 1.2-1 1.6-1 3M15 4c0 1.2-1 1.6-1 3"
                                    stroke="currentColor"
                                    stroke-width="1.4"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
    }
}
