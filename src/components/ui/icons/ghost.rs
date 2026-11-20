use leptos::prelude::*;

/// Ghost, for the placeholder cards.
#[component]
#[must_use]
pub fn GhostIcon() -> impl IntoView {
    view! {
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-3.5"
            aria-hidden="true"
        >
            <path d="M20 21.5 18 20l-2 1.5L14 20l-2 1.5L10 20 8 21.5 6 20l-2 1.5V10a8 8 0 0 1 16 0Z" />
            <circle cx="9" cy="10" r="1.5" fill="var(--color-base-100)" />
            <circle cx="15" cy="10" r="1.5" fill="var(--color-base-100)" />
        </svg>
    }
}
