#![allow(clippy::must_use_candidate, clippy::too_many_lines)]

mod app;

pub mod components {
    pub mod sections {
        pub mod footer;
        pub mod team_deck;
    }

    pub mod cards {
        pub mod team;
    }

    pub mod animations {
        pub mod section_marker;
    }

    pub mod ui {
        pub mod ascii_art;
        pub mod corner_frame;
        pub mod data_grid;
        pub mod link_badges;
        pub mod title_block;
        pub mod viewport;

        pub mod effects {
            pub mod viewport_frame;
        }
    }

    pub use sections::footer::Footer;
    pub use sections::team_deck::TeamDeckSection;

    pub use cards::team::{TeamCard, TeamCardProperties};

    pub use animations::section_marker::SectionMarker;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};
    pub use ui::corner_frame::CornerFrame;
    pub use ui::data_grid::data_grid;
    pub use ui::effects::viewport_frame::ViewportFrame;
    pub use ui::link_badges::LinkBadges;
    pub use ui::title_block::TitleBlock;
    pub use ui::viewport::Viewport;
}

pub mod github;
pub mod mcp;
pub mod utils;

pub use app::*;
pub use components::*;
pub use github::*;
pub use mcp::*;
pub use utils::*;
