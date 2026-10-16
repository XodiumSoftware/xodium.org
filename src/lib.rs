#![allow(clippy::must_use_candidate, clippy::too_many_lines)]

mod app;

pub mod components {
    pub mod sections {
        pub mod building_block;
        pub mod building_blocks_scene;
        pub mod footer;
        pub mod header;
        pub mod scene_context;
    }

    pub mod ui {
        pub mod ascii_art;
        pub mod legend_block;
        pub mod link_badges;
        pub mod title_block;
    }

    pub use sections::building_block::{BuildingBlock, BuildingBlockProperties};
    pub use sections::building_blocks_scene::BuildingBlocksScene;
    pub use sections::footer::Footer;
    pub use sections::header::Header;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};
    pub use ui::legend_block::LegendBlock;
    pub use ui::link_badges::LinkBadges;
    pub use ui::title_block::TitleBlock;
}

pub mod github;
pub mod utils;

pub use app::*;
pub use components::*;
pub use github::*;
pub use utils::*;
