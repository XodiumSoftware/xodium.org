//! xodiumweb — a blueprint-styled static website for Xodium Software.
//!
//! Built with Leptos (client-side rendering) and compiled to WebAssembly via
//! Trunk. The crate exposes the root [`App`] component plus the public
//! modules that make up the page layout, UI primitives, GitHub API client,
//! and shared utilities.

// The Leptos `#[component]` macro rewrites function signatures and strips
// `#[must_use]`, so we allow this lint crate-wide rather than fighting the macro.
#![allow(clippy::must_use_candidate)]

mod app;

pub mod components {
    //! Page sections and reusable UI primitives.

    pub mod effects {
        //! Decorative background effects.
        /// Animated SVG blob background.
        pub mod blob;
    }

    pub mod layout {
        //! Sheet bands that form the blueprint page layout.
        /// Bottom-left site footer.
        pub mod footer;
        /// Sheet opening band.
        pub mod header;
        /// Large focal band of the sheet.
        pub mod hero;
        /// Main content section.
        pub mod main;
        /// Main projects band of the sheet.
        pub mod mainprojects;
        /// Subprojects band of the sheet.
        pub mod subprojects;
        /// Team member overview.
        pub mod team;
    }

    pub mod ui {
        //! Reusable UI primitives and icons.

        pub mod icons {
            //! Inline SVG icons used by link badges and controls.
            /// Buy Me a Coffee cup icon.
            pub mod buy_me_a_coffee;
            /// Cadiotheka Sigma icon.
            pub mod cadiotheka;
            /// GitHub Octocat icon.
            pub mod github;
        }

        /// XODIUM ASCII art header.
        pub mod ascii_art;

        pub use icons::buy_me_a_coffee::BuyMeACoffeeIcon;
        pub use icons::cadiotheka::CadioThekaIcon;
        pub use icons::github::GitHubIcon;
    }

    pub use effects::blob::{BlobBackground, BlobBackgroundProperties};

    pub use layout::footer::Footer;
    pub use layout::header::Header;
    pub use layout::hero::Hero;
    pub use layout::main::{LowerBand, LowerBandState, Main};
    pub use layout::mainprojects::{MainProject, MainProjects, SelectedProject};
    pub use layout::subprojects::Subprojects;
    pub use layout::team::{Team, TeamProperties};

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};
}

pub mod breakpoint;
pub mod github;

pub use app::*;
pub use breakpoint::is_at_least_sm;
pub use components::*;
pub use github::*;
