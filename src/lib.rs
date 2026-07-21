mod app;

pub mod components {
    pub mod sections {
        pub mod footer;
        pub mod header;
        pub mod landing;
        pub mod projects;
        pub mod team_deck;
    }

    pub mod cards {
        pub mod project;
        pub mod team;
    }

    pub mod animations {
        pub mod line_draw;
    }

    pub mod ui {
        pub mod code_block;
        pub mod corner_frame;
        pub mod data_grid;

        pub mod effects {
            pub mod blueprint_grid;
            pub mod hex_grid;
            pub mod parallax;
            pub mod section_fade;
            pub mod wire_frames;
        }
    }

    pub use sections::footer::Footer;
    pub use sections::header::Header;
    pub use sections::landing::LandingSection;
    pub use sections::projects::ProjectsSection;
    pub use sections::team_deck::TeamDeckSection;

    pub use cards::project::{ProjectCard, ProjectCardProperties};
    pub use cards::team::{TeamCard, TeamCardProperties};

    pub use animations::line_draw::{LineDraw, LineDrawHero};

    pub use ui::code_block::CodeBlock;
    pub use ui::corner_frame::CornerFrame;
    pub use ui::data_grid::data_grid;
    pub use ui::effects::blueprint_grid::BlueprintGrid;
    pub use ui::effects::hex_grid::HexPattern;
    pub use ui::effects::parallax::ParallaxLanding;
    pub use ui::effects::section_fade::FadeOverlay;
    pub use ui::effects::wire_frames::WireframeShapes;
}

pub mod github;
pub mod utils;

pub use app::*;
pub use components::*;
pub use github::*;
pub use utils::*;
