//! xodiumweb — the xodium.org site.
//!
//! Leptos client-side rendering, compiled to WebAssembly by Trunk. Modules and
//! re-exports are declared explicitly; there are no `mod.rs` files.

// The Leptos `#[component]` macro strips `#[must_use]` from component functions.
#![allow(clippy::must_use_candidate)]

mod app;

pub mod components {
    //! Page sections and reusable UI primitives.

    pub mod layout {
        //! Page bands, in reading order.
        /// Closing band: wordmark and site links.
        pub mod footer;
        /// Opening band: the ASCII mark and tagline.
        pub mod header;
        /// Focal band: the main projects.
        pub mod hero;
        /// Subproject cards band.
        pub mod subprojects;
    }

    pub mod ui {
        //! UI primitives and icons.

        pub mod icons {
            //! Inline SVG icons.
            /// Rightward arrow.
            pub mod arrow_right;
            /// Branch glyph.
            pub mod branch;
            /// Buy Me a Coffee cup.
            pub mod buy_me_a_coffee;
            /// Cadiotheka mark.
            pub mod cadiotheka;

            /// Users glyph.
            pub mod creators;
            /// Ghost glyph.
            pub mod ghost;
            /// GitHub Octocat.
            pub mod github;
            /// History glyph.
            pub mod history;
            /// Grid glyph.
            pub mod hub;
            /// Package glyph.
            pub mod inspect;
            /// Bolt glyph.
            pub mod speed;
        }

        /// Cursor-following light inside hovered controls.
        pub mod spotlight;

        /// XODIUM ASCII mark.
        pub mod ascii_art;

        pub use spotlight::{SPOTLIGHT_SURFACE, Spotlight, track_spotlights};

        pub use icons::arrow_right::ArrowRightIcon;
        pub use icons::branch::BranchIcon;
        pub use icons::buy_me_a_coffee::BuyMeACoffeeIcon;
        pub use icons::cadiotheka::CadiothekaIcon;

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
    pub use layout::subprojects::Subprojects;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};
}

pub use app::*;
pub use components::*;
