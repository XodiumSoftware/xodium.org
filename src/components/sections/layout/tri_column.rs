//! Three-column band below the hero.
//!
//! The columns share equal width and are separated by vertical rules so the
//! row reads as three drafted cells rather than flowing text.

use leptos::prelude::*;

/// Equal-width three-column region below the hero.
///
/// Stacks to a single column on narrow viewports.
#[component]
#[must_use]
pub fn TriColumn() -> impl IntoView {
    view! {
        <section
            class="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-base-content/40 py-8 border-b border-base-content/40"
            aria-label="Three-column panels"
        >
            <div class="min-h-24 grid place-items-center text-xs uppercase tracking-widest opacity-50">
                "Left"
            </div>
            <div class="min-h-24 grid place-items-center text-xs uppercase tracking-widest opacity-50">
                "Center"
            </div>
            <div class="min-h-24 grid place-items-center text-xs uppercase tracking-widest opacity-50">
                "Right"
            </div>
        </section>
    }
}
