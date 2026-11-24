//! Cursor-following light inside hovered controls.

use leptos::prelude::*;

/// Glow layer that any element carrying [`SPOTLIGHT_SURFACE`] renders.
#[component]
#[must_use]
pub fn Spotlight() -> impl IntoView {
    view! { <span class="spotlight" aria-hidden="true"></span> }
}

/// Marks an element as spotlighted and stacks its content above the glow.
pub const SPOTLIGHT_SURFACE: &str = "spotlight-surface";
