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
use crate::github::fetch_members;
use leptos::prelude::*;
use std::rc::Rc;
use std::time::Duration;

/// How long after load the team prefetch fires. Long enough that the load-in
/// entrance and first paint are not competing with it for the network.
const PREFETCH_DELAY_MS: u64 = 1_500;

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
/// The drawing sheet owns the page width and centring, so this only supplies
/// the inner gutter and stacks the bands from header to footer. It also owns
/// the selected-project state shared by the main projects marks and the hero,
/// and the [`LowerBandState`] that swaps the band below the hero.
///
/// Member data is prefetched here, shortly after load. [`Team`] only exists
/// once the band is opened, so without this the first open pays the full GitHub
/// round trip before any avatar can render. Firing the same call early lands it
/// in the `localStorage` cache that `fetch_members` checks first, turning most
/// first opens into cache hits. The delay keeps the prefetch off the critical
/// path, and a failure is only logged: [`Team`] retries on mount anyway.
#[component]
#[must_use]
pub fn Main() -> impl IntoView {
    let _ = SelectedProject::provide();
    let lower_band = LowerBandState::provide();
    let _ = SheetEntrance::provide();

    Effect::new(move |_| {
        let _ = set_timeout(
            move || {
                leptos::task::spawn_local(async move {
                    if let Err(error) = fetch_members().await {
                        web_sys::console::warn_1(&format!("Team prefetch failed: {error}").into());
                    }
                });
            },
            Duration::from_millis(PREFETCH_DELAY_MS),
        );
    });

    view! {
        <main id="main-content" tabindex="-1" class="flex flex-1 flex-col">
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
