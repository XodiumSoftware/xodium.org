mod app;
mod components {
    mod icons {
        pub mod github;
        pub mod wiki;
    }
    pub mod footer;
    pub mod grid;
    pub mod projectcard;
    pub mod version;
}

pub use app::*;
pub use components::*;
