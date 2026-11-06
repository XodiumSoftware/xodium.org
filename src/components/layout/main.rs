//! Main content section.
//!
//! Hosts the accessible page heading and stacks the layout regions that make
//! up the sheet, in reading order.

use crate::components::layout::footer::Footer;
use crate::components::layout::header::Header;
use crate::components::layout::hero::Hero;
use crate::components::layout::mainprojects::{MainProjects, SelectedProject};
use crate::components::layout::subprojects::Subprojects;
use crate::components::layout::team::{Team, TeamProperties};
use leptos::prelude::*;
use std::rc::Rc;
use std::time::Duration;

/// Whether the sheet's load-in entrance should still play.
///
/// A plain CSS class cannot express "animate once on page load": a class on the
/// band replays whenever that band mounts, and a band mounted by the lower-band
/// swap is the same component as the one on first paint. This signal starts
/// `true`, so the initial view animates, and flips to `false` after the entrance
/// duration so any band mounted later is drawn fully formed. The swap therefore
/// never animates, whichever direction it goes.
#[derive(Clone, Copy)]
#[must_use]
pub struct SheetEntrance(RwSignal<bool>);

impl SheetEntrance {
    /// Start the entrance timer and provide the flag to the page.
    pub fn provide() -> Self {
        let entrance = Self(RwSignal::new(true));
        provide_context(entrance);

        let finished = entrance.0;
        let _ = set_timeout(
            move || finished.set(false),
            Duration::from_millis(SheetEntrance::DURATION_MS),
        );
        entrance
    }

    /// Read the signal out of context.
    ///
    /// # Panics
    ///
    /// Panics when [`SheetEntrance::provide`] has not run, which means the page
    /// was assembled without the entrance owner.
    pub fn use_context() -> Self {
        expect_context::<Self>()
    }

    /// The class that plays the band entrance, or an empty string once the
    /// load-in entrance is over.
    pub fn band_class(self) -> &'static str {
        if self.0.get() { "sheet-band-enter" } else { "" }
    }

    /// The class that plays the lower-band swap animation.
    ///
    /// The two bands below the hero trade places instead of sliding in with the
    /// rest of the stack, so they get their own quieter crossfade. It is only
    /// applied once the load-in entrance is over: during first paint the band is
    /// already animating, and a second animation on the same element would
    /// override the `slide-up` reveal.
    pub fn swap_class(self) -> &'static str {
        if self.0.get() { "" } else { "sheet-band-swap" }
    }

    /// Longest band delay (`subprojects`) plus the band animation length, so the
    /// flag never flips while a band is still moving.
    const DURATION_MS: u64 = 1_100;
}

/// Which band occupies the slot below the hero.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum LowerBand {
    /// Default: the three subproject cards.
    #[default]
    Subprojects,
    /// The Xodium team, shown once the footer's team entry is used.
    Team,
}

/// Shared so the footer can swap the lower band without owning the band stack.
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

    /// Read the signal out of context.
    ///
    /// # Panics
    ///
    /// Panics when [`LowerBandState::provide`] has not run, which means the
    /// page was assembled without the shared band selection.
    pub fn use_context() -> Self {
        expect_context::<Self>()
    }

    /// The band currently shown in the lower slot.
    pub fn get(self) -> LowerBand {
        self.0.get()
    }

    /// Replace the band in the lower slot.
    pub fn set(self, band: LowerBand) {
        self.0.set(band);
    }

    /// Switch to the other band, so one entry toggles both ways.
    pub fn toggle(self) {
        self.set(match self.get() {
            LowerBand::Subprojects => LowerBand::Team,
            LowerBand::Team => LowerBand::Subprojects,
        });
    }
}

/// The central content area of the page.
///
/// The drawing sheet owns the page width and centring, so this only supplies
/// the inner gutter and stacks the bands from header to footer. It also owns
/// the selected-project state shared by the main projects marks and the hero,
/// and the [`LowerBandState`] that swaps the band below the hero.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let _ = SelectedProject::provide();
    let lower_band = LowerBandState::provide();
    let _ = SheetEntrance::provide();

    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col px-6">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

            <Header />
            <MainProjects />
            <Hero />
            {move || match lower_band.get() {
                LowerBand::Subprojects => view! { <Subprojects /> }.into_any(),
                LowerBand::Team => {
                    view! {
                        <Team props=TeamProperties {
                            on_close: Rc::new(move || {
                                lower_band.set(LowerBand::Subprojects);
                            }),
                        } />
                    }
                        .into_any()
                }
            }}
            <Footer />
        </main>
    }
}
