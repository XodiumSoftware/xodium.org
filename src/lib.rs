#![allow(clippy::must_use_candidate, clippy::too_many_lines)]

mod app;

pub mod components {
    pub mod scenes {
        pub mod object_3d_scene;
    }

    pub mod sections {
        pub mod footer;
        pub mod header;
    }

    pub mod ui {
        pub mod icons {
            pub mod buy_me_a_coffee;
            pub mod github;
        }

        pub mod ascii_art;
        pub mod axis_gizmo;
        pub mod legend_block;
        pub mod link_badges;
        pub mod object_3d;
        pub mod team_deck;
        pub mod title_block;

        pub use icons::buy_me_a_coffee::BuyMeACoffeeIcon;
        pub use icons::github::GitHubIcon;
    }

    pub use scenes::object_3d_scene::Object3dScene;
    pub use sections::footer::Footer;
    pub use sections::header::Header;

    pub use ui::ascii_art::{AsciiArt, XODIUM_ASCII_ART};
    pub use ui::axis_gizmo::{AxisGizmo, AxisGizmoProperties};
    pub use ui::legend_block::LegendBlock;
    pub use ui::link_badges::LinkBadges;
    pub use ui::object_3d::{
        Attachment, Corner, Dimensions, Face, FaceColors, Object3d, Object3dProperties, Position,
    };
    pub use ui::team_deck::TeamDeck;
    pub use ui::title_block::TitleBlock;
}

pub mod contexts {
    pub mod scene;
}

pub use contexts::scene::{DRAG_CLICK_SUPPRESS_MS, SceneContext};

pub mod github;
pub mod utils;

pub use app::*;
pub use components::*;
pub use github::*;
pub use utils::*;
