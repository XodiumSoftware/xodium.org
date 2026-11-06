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
        /// Team member overview.
        pub mod team;
        /// Three-column band of the sheet.
        pub mod tri_column;
        /// Two-column band of the sheet.
        pub mod two_column;
    }

    pub mod ui {
        //! Reusable UI primitives and icons.

        pub mod icons {
            //! Inline SVG icons used by link badges and controls.
            /// Buy Me a Coffee cup icon.
            pub mod buy_me_a_coffee;
            /// GitHub Octocat icon.
            pub mod github;
        }

        /// XODIUM ASCII art header.
        pub mod ascii_art;
        /// Keyboard shortcut legend.
        pub mod legend_block;
        /// External link badges with keyboard shortcuts.
        pub mod link_badges;
        /// Blueprint title-block metadata table.
        pub mod title_block;

        pub use icons::buy_me_a_coffee::BuyMeACoffeeIcon;
        pub use icons::github::GitHubIcon;
    }

    pub use layout::footer::Footer;
    pub use layout::header::Header;
    pub use layout::hero::Hero;
    pub use layout::main::Main;
    pub use layout::team::{Team, TeamProperties};
    pub use layout::tri_column::TriColumn;
    pub use layout::two_column::TwoColumn;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};

    pub use ui::legend_block::LegendBlock;
    pub use ui::link_badges::LinkBadges;
    pub use ui::title_block::TitleBlock;
}

pub mod github;

/// Shared utilities and constants used across the site.
pub mod utils;

pub use app::*;
pub use components::*;
pub use github::*;
pub use utils::*;
