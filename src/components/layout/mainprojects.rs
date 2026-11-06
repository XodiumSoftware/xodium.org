//! Main projects band, directly below the header.
//!
//! Two equal-width panels separated by a vertical rule.

use leptos::prelude::*;

/// Main projects region below the header.
///
/// Renders an equal-width left panel and right panel separated by a vertical
/// rule. The panels stack on narrow viewports, with the left panel on top.
#[component]
#[must_use]
pub fn MainProjects() -> impl IntoView {
    view! {
        <section
            class="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-base-content/40"
            aria-label="Main projects"
        >
            <div class="min-h-24 grid place-items-center text-xs uppercase tracking-widest opacity-50">
                "Main project 1"
            </div>
            <div class="min-h-24 grid place-items-center text-xs uppercase tracking-widest opacity-50 md:border-l md:border-base-content/40 md:pl-6">
                "Main project 2"
            </div>
        </section>
    }
}
