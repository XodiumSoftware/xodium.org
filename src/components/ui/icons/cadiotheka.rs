//! `CadioThekaIcon` — Sigma letter icon.

use leptos::prelude::*;

/// Renders a capital Sigma (Σ) glyph as an inline SVG icon with a glassy
/// silver stroke.
#[component]
pub fn CadioThekaIcon() -> impl IntoView {
    view! {
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            <defs>
                <linearGradient id="cadiotheka-silver" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#f5f7fa" />
                    <stop offset="40%" stop-color="#d7dce1" />
                    <stop offset="60%" stop-color="#a8b0b8" />
                    <stop offset="100%" stop-color="#eef1f4" />
                </linearGradient>
            </defs>
            <path d="M4 5h16" stroke="url(#cadiotheka-silver)" />
            <path d="M4 5l8 7-8 7" stroke="url(#cadiotheka-silver)" />
            <path d="M20 19H4" stroke="url(#cadiotheka-silver)" />
        </svg>
    }
}
