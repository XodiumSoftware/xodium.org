//! Hero band — the largest focal region of the sheet.
//!
//! Sits between the two-column row and the three-column row and grows to fill
//! whatever vertical room the bands above leave, so the sections below are
//! pushed to the bottom of the sheet.

use leptos::prelude::*;

/// Large focal region in the middle of the sheet.
///
/// `grow` lets it absorb the sheet's leftover height, which is what pushes the
/// three-column row and footer downwards. `baseline` only holds on tall
/// viewports; once the content is taller than the sheet, the hero keeps its
/// natural height and the page scrolls normally.
#[component]
#[must_use]
pub fn Hero() -> impl IntoView {
    view! {
        <section
            class="grid place-items-center grow basis-80 py-16 border-b border-base-content/40"
            aria-label="Hero"
        >
            <div class="text-xs uppercase tracking-widest opacity-50">"Hero"</div>
        </section>
    }
}
