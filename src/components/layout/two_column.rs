//! Two-column band that sits directly below the header.
//!
//! Both columns share equal width, separated by a vertical rule.

use leptos::prelude::*;

/// Two-column region below the header.
///
/// Renders an equal-width left panel and right panel separated by a vertical
/// rule. The columns stack on narrow viewports, with the left panel on top.
#[component]
#[must_use]
pub fn TwoColumn() -> impl IntoView {
    view! {
        <section
            class="grid grid-cols-1 md:grid-cols-2 gap-6 py-8 border-b border-base-content/40"
            aria-label="Left and right panels"
        >
            <div class="min-h-24 grid place-items-center text-xs uppercase tracking-widest opacity-50">
                "Left"
            </div>
            <div class="min-h-24 grid place-items-center text-xs uppercase tracking-widest opacity-50 md:border-l md:border-base-content/40 md:pl-6">
                "Right"
            </div>
        </section>
    }
}
