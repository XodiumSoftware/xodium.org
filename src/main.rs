use leptos::prelude::*;
use xodiumweb::version::{Version, VersionProps};
use xodiumweb::App;

fn main() {
    console_error_panic_hook::set_once();
    mount_to_body(App);
    mount_to_body(move || Version(VersionProps { version: "1.0.0" }));
}
