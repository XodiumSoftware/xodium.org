use leptos::prelude::*;
use xodiumweb::version::{Version, VersionProps};
use xodiumweb::App;

const CONFIG_VERSION: &str = "1.0.0";

fn main() {
    console_error_panic_hook::set_once();
    mount_to_body(App);
    mount_to_body(move || {
        Version(VersionProps {
            version: CONFIG_VERSION,
        })
    });
}
