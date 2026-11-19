use leptos::prelude::*;

/// Renders a rightward arrow, for the call-to-action card.
///
/// Outline only, so it inherits `currentColor` and the caller's size utility.
#[component]
#[must_use]
pub fn ArrowRightIcon() -> impl IntoView {
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
            <line x1="4" y1="12" x2="20" y2="12" />
            <polyline points="14 6 20 12 14 18" />
        </svg>
    }
}
