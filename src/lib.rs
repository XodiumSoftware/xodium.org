#![allow(clippy::must_use_candidate, clippy::too_many_lines)]

mod app;

pub mod components {
    pub mod sections {
        pub mod footer;
    }

    pub mod ui {
        pub mod ascii_art;
        pub mod link_badges;
        pub mod title_block;
    }

    pub use sections::footer::Footer;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};
    pub use ui::link_badges::LinkBadges;
    pub use ui::title_block::TitleBlock;
}

pub mod github;

pub use app::*;
pub use components::*;
pub use github::*;
