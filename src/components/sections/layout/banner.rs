//! Banner band that opens the sheet.
//!
//! Sits at the top of the drawing, above the two-column row.

use leptos::prelude::*;

/// Full-width banner region at the top of the sheet.
///
/// Renders a bordered drafting band with a placeholder body until the real
/// banner content is designed.
#[component]
#[must_use]
pub fn Banner() -> impl IntoView {
    view! {
        <section
            class="border-b border-base-content/40 py-6"
            aria-label="Banner"
        >
            <div class="min-h-16 grid place-items-center text-xs uppercase tracking-widest opacity-50">
                "Banner"
            </div>
        </section>
    }
}
