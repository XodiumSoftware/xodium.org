//! Main content section.
//!
//! Hosts the accessible page heading and stacks the layout regions that make
//! up the sheet, in reading order.

use crate::components::layout::footer::Footer;
use crate::components::layout::header::Header;
use crate::components::layout::hero::Hero;
use crate::components::layout::mainprojects::{MainProjects, SelectedProject};
use crate::components::layout::subprojects::Subprojects;
use crate::components::layout::team::Team;
use leptos::prelude::*;
use std::time::Duration;

/// Tracks whether the sheet's load-in entrance should still play, and whether
/// the lower-band swap has actually happened yet.
///
/// A plain CSS class cannot express "animate once on page load": a class on the
/// band replays whenever that band mounts, and a band mounted by the lower-band
/// swap is the same component as the one on first paint.
///
/// Two flags are needed rather than one because the entrance and the swap
/// animate *different elements*: the entrance runs `slide-up` on the band, while
/// the swap runs its crossfade on the band's children. Because they do not
/// override each other, handing `sheet-band-swap` to the band that is already on
/// screen would start a second animation on its cards the moment the entrance
/// finished, which reads as a flicker. The swap class is therefore withheld
/// until a swap has actually been requested.
///
/// The swap fades the band's children rather than the band itself so the band
/// box, and with it the bottom rule, keeps full opacity throughout: the rules
/// under the lower band and above it stay put while only the contents
/// crossfade. Only the load-in entrance moves a rule.
///
/// The entrance stagger is carried by a per-band `--band-delay` in
/// `public/style.css`, read here through `sheet-band-enter`'s
/// `var(--band-delay, 500ms)`. A band that is never handed `band_class`
/// therefore has no delay to consume: [`MainProjects`] sits above the hero and
/// [`Team`] is only reachable through the swap, so only the header, hero,
/// subprojects and footer carry one.
#[derive(Clone, Copy)]
#[must_use]
pub struct SheetEntrance {
    /// True while the load-in entrance is still playing.
    loading: RwSignal<bool>,
    /// True once the lower band has changed at least once.
    swapped: RwSignal<bool>,
}

impl SheetEntrance {
    /// Start the entrance timer and provide the flags to the page.
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

    /// Read the signals out of context.
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
        if self.loading.get() {
            "sheet-band-enter"
        } else {
            ""
        }
    }

    /// The class that plays the lower-band swap animation.
    ///
    /// Empty until a swap has been requested, so the band on screen during the
    /// load-in keeps its `slide-up` reveal and is never re-animated by the swap
    /// class appearing under it.
    pub fn swap_class(self) -> &'static str {
        if self.loading.get() || !self.swapped.get() {
            ""
        } else {
            "sheet-band-swap"
        }
    }

    /// Record that the lower band is being swapped, arming [`Self::swap_class`].
    ///
    /// # Panics
    ///
    /// Panics when [`SheetEntrance::provide`] has not run.
    pub fn mark_swapped(self) {
        self.swapped.set(true);
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
    ///
    /// Arms the swap animation, so the incoming band crossfades. A `set` to the
    /// band already shown is a no-op and leaves the flag alone.
    pub fn set(self, band: LowerBand) {
        if self.get() == band {
            return;
        }

        SheetEntrance::use_context().mark_swapped();
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
/// The drawing sheet owns the page width and centring, so the frame rules come
/// from the sheet wrapper's utilities rather than from this element: `main` only
/// stacks the bands inside the sheet's gutter and provides the stacking context
/// above the fixed page surface.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let _ = SelectedProject::provide();
    let lower_band = LowerBandState::provide();
    let _ = SheetEntrance::provide();

    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col">
            <h1 class="sr-only">"Xodium Software — open-source CAD software"</h1>

            <Header />
            <MainProjects />
            <Hero />
            {move || match lower_band.get() {
                LowerBand::Subprojects => view! { <Subprojects /> }.into_any(),
                LowerBand::Team => view! { <Team /> }.into_any(),
            }}
            <Footer />
        </main>
    }
}
