use leptos::prelude::*;

/// Section-cut marker: the circled letter with cut arrows used on engineering
/// drawings to indicate where a section is taken.
///
/// Renders an SVG with a horizontal line, a circled identifier in the middle,
/// and short arrowheads at both ends pointing outward. Animates the line in
/// with the same stroke-dashoffset technique as [`crate::components::animations::line_draw::LineDraw`].
#[component]
#[must_use]
pub fn SectionMarker(
    /// Single letter or short identifier shown inside the circle (e.g. "A", "B").
    letter: &'static str,
) -> impl IntoView {
    view! {
        <div class="relative w-full h-20 overflow-hidden" aria-hidden="true">
            <svg
                class="absolute inset-0 w-full h-full"
                viewBox="0 0 1200 80"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g stroke="var(--color-primary)" fill="none">
                    // Left leader line
                    <line
                        x1="0" y1="40" x2="560" y2="40"
                        class="cad-line-draw"
                        stroke-width="1.5"
                    />
                    // Right leader line
                    <line
                        x1="640" y1="40" x2="1200" y2="40"
                        class="cad-line-draw"
                        stroke-width="1.5"
                    />

                    // Left arrowhead (pointing outward)
                    <path d="M 40,40 L 60,32 M 40,40 L 60,48" stroke-width="1.5" />
                    // Right arrowhead (pointing outward)
                    <path d="M 1160,40 L 1140,32 M 1160,40 L 1140,48" stroke-width="1.5" />

                    // Center circle with letter
                    <circle cx="600" cy="40" r="22" stroke-width="1.5" fill="var(--color-base-100)" />
                    <text
                        x="600" y="46"
                        text-anchor="middle"
                        stroke="none"
                        fill="var(--color-primary)"
                        font-family="var(--font-mono, ui-monospace, monospace)"
                        font-size="18"
                        font-weight="600"
                    >
                        {letter}
                    </text>

                    // Small tick marks flanking the circle
                    <line x1="540" y1="36" x2="540" y2="44" stroke-width="1" stroke-opacity="0.6" />
                    <line x1="660" y1="36" x2="660" y2="44" stroke-width="1" stroke-opacity="0.6" />
                </g>
            </svg>
        </div>
    }
}
