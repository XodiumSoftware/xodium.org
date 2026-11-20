//! Main content section.

use crate::components::layout::footer::Footer;
use crate::components::layout::header::Header;
use crate::components::layout::hero::Hero;
use crate::components::layout::subprojects::Subprojects;
use leptos::prelude::*;
use std::time::Duration;

/// The sheet's load-in entrance state.
#[derive(Clone, Copy)]
#[must_use]
pub struct SheetEntrance {
    /// True while the load-in entrance is still playing.
    loading: RwSignal<bool>,
}

impl SheetEntrance {
    /// Provide the flag to the page and start the entrance timer.
    pub fn provide() -> Self {
        let entrance = Self {
            loading: RwSignal::new(true),
        };
        provide_context(entrance);

        let loading = entrance.loading;
        let _ = set_timeout(
            move || loading.set(false),
            Duration::from_millis(SheetEntrance::DURATION_MS),
        );
        entrance
    }

    /// Read the flag out of context.
    ///
    /// # Panics
    ///
    /// Panics when the flag was never provided.
    pub fn use_context() -> Self {
        expect_context::<Self>()
    }

    /// The load-in entrance class, or `""` once it is over.
    pub fn band_class(self) -> &'static str {
        if self.loading.get() {
            "sheet-band-enter"
        } else {
            ""
        }
    }

    /// How long the entrance flag stays set.
    const DURATION_MS: u64 = 1_100;
}

/// The central content area of the page.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let _ = SheetEntrance::provide();

    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

            <Header />
            <Hero />
            <Subprojects />
            <Footer />
        </main>
    }
}
