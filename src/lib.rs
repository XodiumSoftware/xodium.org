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

    pub mod sections {
        //! Page sections that form the blueprint page layout.
        /// Bottom-left site footer.
        pub mod footer;
        /// Bottom-right corner metadata stack.
        pub mod header;
        /// Main isometric drawing viewport.
        pub mod main;
        /// Team modal overlay triggered from the 3D scene.
        pub mod team;
        /// Isometric 3D object viewport used by `Main`.
        pub mod three_d;
    }

    pub mod ui {
        //! Reusable UI primitives, icons, and 3D drawing helpers.

        pub mod icons {
            //! Inline SVG icons used by link badges and controls.
            /// Buy Me a Coffee cup icon.
            pub mod buy_me_a_coffee;
            /// GitHub Octocat icon.
            pub mod github;
        }

        /// XODIUM ASCII art header.
        pub mod ascii_art;
        /// GitHub member avatar item.
        pub mod avatar;
        /// Keyboard shortcut legend.
        pub mod legend_block;
        /// External link badges with keyboard shortcuts.
        pub mod link_badges;
        /// Isometric wireframe objects and shape primitives.
        pub mod shapes;
        /// Blueprint title-block metadata table.
        pub mod title_block;

        pub use icons::buy_me_a_coffee::BuyMeACoffeeIcon;
        pub use icons::github::GitHubIcon;
    }

    pub use sections::footer::Footer;
    pub use sections::header::Header;
    pub use sections::main::Main;
    pub use sections::team::Team;
    pub use sections::three_d::Object3dScene;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};

    pub use ui::avatar::Avatar;
    pub use ui::legend_block::LegendBlock;
    pub use ui::link_badges::LinkBadges;
    pub use ui::shapes::{
        Attachment, Face, FaceColors, Object3d, Object3dProperties, Position, Shape,
    };
    pub use ui::title_block::TitleBlock;
}

pub mod github;

/// Shared utilities and constants used across the site.
pub mod utils;

pub use app::*;
pub use components::*;
pub use github::*;
pub use utils::*;
