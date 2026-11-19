//! Main content section.
//!
//! Hosts the page heading and stacks the sheet's bands in reading order.

use crate::components::layout::footer::Footer;
use crate::components::layout::header::Header;
use crate::components::layout::hero::Hero;
use crate::components::layout::subprojects::Subprojects;
use crate::components::layout::team::Team;
use leptos::prelude::*;
use std::time::Duration;

/// Owns the sheet's two animations: the load-in entrance and the lower-band swap.
///
/// Two flags, because the two animate different elements: the entrance runs on
/// the band, the swap crossfades the band's children. Collapsing them would
/// re-animate a band's contents the moment the entrance ended, which reads as a
/// flicker.
///
/// The swap is withheld until a swap is actually requested, so the band on screen
/// during load-in is never re-animated. [`Team`] is only reachable through the
/// swap, so it never receives [`SheetEntrance::band_class`] and needs no
/// `--band-delay`.
#[derive(Clone, Copy)]
#[must_use]
pub struct SheetEntrance {
    /// True while the load-in entrance is still playing.
    loading: RwSignal<bool>,
    /// True once the lower band has changed at least once.
    swapped: RwSignal<bool>,
}

impl SheetEntrance {
    /// Provide the flags to the page and start the entrance timer.
    pub fn provide() -> Self {
        let entrance = Self {
            loading: RwSignal::new(true),
            swapped: RwSignal::new(false),
        };
        provide_context(entrance);

        let loading = entrance.loading;
        let _ = set_timeout(
            move || loading.set(false),
            Duration::from_millis(SheetEntrance::DURATION_MS),
        );
        entrance
    }

    /// Read the flags out of context.
    ///
    /// # Panics
    ///
    /// Panics when [`SheetEntrance::provide`] has not run.
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

    /// The swap class, or `""` until a swap has been requested.
    pub fn swap_class(self) -> &'static str {
        if self.loading.get() || !self.swapped.get() {
            ""
        } else {
            "sheet-band-swap"
        }
    }

    /// Record a requested swap, arming [`Self::swap_class`].
    ///
    /// # Panics
    ///
    /// Panics when [`SheetEntrance::provide`] has not run.
    pub fn mark_swapped(self) {
        self.swapped.set(true);
    }

    /// The longest `--band-delay` plus the band animation, so the flag never
    /// flips mid-animation.
    const DURATION_MS: u64 = 1_100;
}

/// Which band occupies the slot below the hero.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum LowerBand {
    /// Default: the three subproject cards.
    #[default]
    Subprojects,
    /// The Xodium team.
    Team,
}

/// The band shown in the slot below the hero, shared with the footer toggle.
#[derive(Clone, Copy)]
#[must_use]
pub struct LowerBandState(RwSignal<LowerBand>);

impl LowerBandState {
    /// Provide the band state to the page and return it.
    pub fn provide() -> Self {
        let state = Self(RwSignal::new(LowerBand::default()));
        provide_context(state);
        state
    }

    /// Read the state out of context.
    ///
    /// # Panics
    ///
    /// Panics when [`LowerBandState::provide`] has not run.
    pub fn use_context() -> Self {
        expect_context::<Self>()
    }

    /// The band currently shown.
    pub fn get(self) -> LowerBand {
        self.0.get()
    }

    /// Replace the band, arming the swap animation. Setting the band already
    /// shown is a no-op.
    pub fn set(self, band: LowerBand) {
        if self.get() == band {
            return;
        }

        SheetEntrance::use_context().mark_swapped();
        self.0.set(band);
    }

    /// Switch to the other band, so one control toggles both ways.
    pub fn toggle(self) {
        self.set(match self.get() {
            LowerBand::Subprojects => LowerBand::Team,
            LowerBand::Team => LowerBand::Subprojects,
        });
    }
}

/// The central content area of the page.
///
/// The sheet wrapper owns width and centring, so `main` only stacks the bands
/// and provides the shared state they read.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let lower_band = LowerBandState::provide();
    let _ = SheetEntrance::provide();

    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

            <Header />
            <Hero />
            {move || match lower_band.get() {
                LowerBand::Subprojects => view! { <Subprojects /> }.into_any(),
                LowerBand::Team => view! { <Team /> }.into_any(),
            }}
            <Footer />
        </main>
    }
}
