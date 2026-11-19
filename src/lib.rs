//! xodiumweb — a blueprint-styled static site for Xodium Software.
//!
//! Leptos client-side rendering, compiled to WebAssembly by Trunk. The module
//! tree and every re-export are declared here explicitly; there are no
//! `mod.rs` files.

// The Leptos `#[component]` macro rewrites signatures and strips `#[must_use]`,
// so this lint is allowed crate-wide rather than fought per component.
#![allow(clippy::must_use_candidate)]

mod app;

pub mod components {
    //! Page sections and reusable UI primitives.

    pub mod layout {
        //! Sheet bands, stacked top to bottom.
        /// Closing band: wordmark, band toggle, site links.
        pub mod footer;
        /// Opening band: the ASCII mark and tagline.
        pub mod header;
        /// Large focal band of the sheet, split into the two main projects.
        pub mod hero;
        /// Main content section.
        pub mod main;
        /// Subproject cards band.
        pub mod subprojects;
        /// Team avatar band.
        pub mod team;
    }

    pub mod ui {
        //! Reusable UI primitives and icons.

        pub mod icons {
            //! Brand icons.
            /// Buy Me a Coffee cup icon.
            pub mod buy_me_a_coffee;
            /// Cadiotheka brand glyph.
            pub mod cadiotheka;
            /// GitHub Octocat icon.
            pub mod github;
        }

        /// XODIUM ASCII mark.
        pub mod ascii_art;

        pub use icons::buy_me_a_coffee::BuyMeACoffeeIcon;
        pub use icons::cadiotheka::CadioThekaIcon;
        pub use icons::github::GitHubIcon;
    }

    pub use layout::footer::Footer;
    pub use layout::header::Header;
    pub use layout::hero::Hero;
    pub use layout::main::{LowerBand, LowerBandState, Main};
    pub use layout::subprojects::Subprojects;
    pub use layout::team::Team;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};
}

pub use app::*;
pub use components::*;
