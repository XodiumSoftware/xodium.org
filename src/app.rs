//! Root application component and the single-page layout.
//!
//! `App` assembles the skip link and main content section into one
//! blueprint-styled page.
//!
//! The page frame (`.blueprint-frame`, `.blueprint-sheet` and the rules painted
//! by `body::before` and `.blueprint-sheet::before`) lives in
//! `public/style.css`, because it needs `::before` rules and a viewport-relative
//! minimum height that utilities cannot express. Its intent:
//!
//! - `body::before` paints the page surface as a fixed layer, faded in by
//!   `grid-in`, so the sheet scrolls over a still background instead of moving
//!   a painted colour with the document.
//!
//! - `.blueprint-sheet::before` draws only the left and right rules, inset by
//!   8px. The bands close the sheet horizontally on their own, so a full frame
//!   would double their rules; the crop at the top and bottom is what makes the
//!   page read as a plate. The rule is `base-content` at 40%, the same colour as
//!   the `border-base-content/40` band dividers, and `frame-in` scales it up from
//!   1.005 rather than fading it, so the plate draws before the bands arrive.
//!
//! - The focus ring is global: `:focus-visible` draws it and
//!   `:focus:not(:focus-visible)` removes the pointer-focus outline. `DaisyUI`
//!   does not set one, so removing those rules drops keyboard focus styling
//!   site-wide.
//!
//! The square `--radius-*` and `--depth` overrides on `[data-theme="halloween"]`
//! are applied unlayered rather than through a second `daisyui/theme` block, so
//! the built-in palette is untouched while they still win over the theme's
//! `@layer base` declarations.

use crate::components::layout::main::Main;
use leptos::prelude::*;

/// The full single-page blueprint drawing.
///
/// `Main` owns the whole sheet: the header, the project and hero bands, the
/// subprojects/team slot and the footer all render inside it, so this only
/// supplies the frame, the drawing sheet and the skip link.
#[component]
#[must_use]
pub fn App() -> impl IntoView {
    view! {
        <div class="blueprint-frame">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <div class="blueprint-sheet">
                <Main />
            </div>
        </div>
    }
}
