//! `CadioThekaIcon` — Sigma letter icon.

use leptos::prelude::*;

/// Renders a stylised capital Sigma (Σ) glyph as an inline SVG icon.
///
/// The letter is drawn with a double-stroke outline and clipped horizontal
/// bars that break the silhouette into three stacked segments, giving it an
/// engineering-drawing feel.
#[component]
pub fn CadioThekaIcon() -> AnyView {
    view! {
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <g
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="square"
                stroke-linejoin="miter"
            >
                <!-- Outer frame of the Sigma -->
                <path d="M6 4h12l-5 8 5 8H6" />

                <!-- Inner inset outline -->
                <path
                    d="M7.5 6h8l-3.5 6 3.5 6h-8"
                    stroke-width="1"
                    opacity="0.6"
                />

                <!-- Horizontal break lines -->
                <line x1="3" y1="12" x2="21" y2="12" stroke-dasharray="4 4" opacity="0.9" />
                <line x1="4" y1="8" x2="20" y2="8" stroke-width="1" opacity="0.4" />
                <line x1="4" y1="16" x2="20" y2="16" stroke-width="1" opacity="0.4" />
            </g>
        </svg>
    }
    .into_any()
}
