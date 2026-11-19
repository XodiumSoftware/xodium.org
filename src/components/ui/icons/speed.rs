use leptos::prelude::*;

/// Renders the bolt glyph used for the "fast by design" feature.
///
/// Outline only, so it inherits `currentColor` and the caller's size utility.
#[component]
#[must_use]
pub fn SpeedIcon() -> impl IntoView {
    view! {
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="size-3.5"
            aria-hidden="true"
        >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    }
}
