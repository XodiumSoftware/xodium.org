use crate::components::ui::ascii_art::AsciiArt;
use leptos::prelude::*;

/// The sheet's opening band.
///
/// Currently holds only the XODIUM glyph mark. The keyboard legend, link
/// badges and title block are unmounted while the band is settled, but they
/// remain built and exported from the crate.
#[component]
#[must_use]
pub fn Header() -> impl IntoView {
    view! {
        <header
            class="flex items-center py-6 border-b border-base-content/40"
            aria-label="Site header"
        >
            <AsciiArt />
        </header>
    }
}
