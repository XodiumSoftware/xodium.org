use leptos::prelude::*;
use xodiumweb::App;
use xodiumweb::version::{Version, VersionProps};

fn main() {
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
    mount_to_body(App);
    mount_to_body(move || Version(VersionProps { version: "1.0.0" }));
}
