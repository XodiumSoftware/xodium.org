//! Root application component and the single-page layout.
//!
//! The page shell is utilities; `public/style.css` keeps only what utilities
//! cannot express:
//!
//! - `body::before` paints the page surface as a fixed layer, so the sheet scrolls
//!   over a still background. A pseudo-element has no class slot.
//!
//! - `.sheet-frame::before` is the sheet's entrance layer. It no longer draws the
//!   sheet's side rules; those come from the `body` border in `public/style.css`.
//!
//! - The global `:focus-visible` ring, which `DaisyUI` does not provide.
//!
//! - The square `--radius-*` and `--depth` overrides: unlayered so they win over
//!   the theme's `@layer base` without replacing the palette.

use crate::components::layout::main::Main;
use leptos::prelude::*;

/// The full single-page drawing.
///
/// `Main` owns the sheet's contents, so this supplies only the frame, the sheet
/// wrapper and the skip link.
#[component]
#[must_use]
pub fn App() -> impl IntoView {
    view! {
        <div class="relative flex min-h-dvh flex-col">
            <a
                href="#main-content"
                class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
            >
                "Skip to main content"
            </a>

            <div class="sheet-frame relative flex flex-1 flex-col w-[calc(100%-36px)] max-w-5xl mx-auto my-[18px]">
                <Main />
            </div>
        </div>
    }
}
