mod app;
mod components {
    pub mod footer;
    pub mod grid;
    pub mod header;
    pub mod projectcard;
    pub mod projectgrid;
    pub mod teamgrid;
    pub mod typewriter;
    pub mod version;
}
pub mod github;

pub use app::*;
pub use components::*;
pub use github::*;
