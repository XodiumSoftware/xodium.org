//! `CadioThekaIcon` — Sigma letter icon.

use leptos::prelude::*;

/// Renders a geometric capital Sigma (Σ) glyph as an inline SVG icon.
///
/// The letter is built from three stacked, slightly inset bars — a top bar, a
/// middle chevron, and a bottom bar — with subtle construction guidelines that
/// read as a drafting-grid detail rather than a decorative flourish.
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
                stroke-width="1.75"
                stroke-linecap="butt"
                stroke-linejoin="miter"
            >
                {/* Top horizontal bar */}
                <path d="M4 5h16" />

                {/* Middle chevron — two segments meeting at the centre */}
                <path d="M4 5 L20 12 L4 12" />
                <path d="M4 12 L20 19" />

                {/* Bottom horizontal bar */}
                <path d="M4 19h16" />

                {/* Construction detail: thin vertical ticks marking the bar edges */}
                <line x1="4" y1="4" x2="4" y2="6" stroke-width="1" opacity="0.6" />
                <line x1="20" y1="4" x2="20" y2="6" stroke-width="1" opacity="0.6" />
                <line x1="20" y1="11" x2="20" y2="13" stroke-width="1" opacity="0.6" />
                <line x1="4" y1="11" x2="4" y2="13" stroke-width="1" opacity="0.6" />
                <line x1="4" y1="18" x2="4" y2="20" stroke-width="1" opacity="0.6" />
                <line x1="20" y1="18" x2="20" y2="20" stroke-width="1" opacity="0.6" />
            </g>
        </svg>
    }
    .into_any()
}
