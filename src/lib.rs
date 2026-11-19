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
            //! Inline SVG icons.
            /// Branch glyph for the open-source feature.
            pub mod branch;
            /// Buy Me a Coffee cup icon.
            pub mod buy_me_a_coffee;
            /// Cadiotheka brand glyph.
            pub mod cadiotheka;
            /// Users glyph for the creators feature.
            pub mod creators;
            /// Ghost, for the blurred placeholder cards.
            pub mod ghost;
            /// GitHub Octocat icon.
            pub mod github;
            /// History glyph for the versioned-parts feature.
            pub mod history;
            /// Grid glyph for the hub feature.
            pub mod hub;
            /// Package glyph for the inspect-before-download feature.
            pub mod inspect;
            /// Bolt glyph for the fast-by-design feature.
            pub mod speed;
        }

        /// XODIUM ASCII mark.
        pub mod ascii_art;

        pub use icons::branch::BranchIcon;
        pub use icons::buy_me_a_coffee::BuyMeACoffeeIcon;
        pub use icons::cadiotheka::CadioThekaIcon;
        pub use icons::creators::CreatorsIcon;
        pub use icons::ghost::GhostIcon;
        pub use icons::github::GitHubIcon;
        pub use icons::history::HistoryIcon;
        pub use icons::hub::HubIcon;
        pub use icons::inspect::InspectIcon;
        pub use icons::speed::SpeedIcon;
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
