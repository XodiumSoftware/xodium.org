use leptos::prelude::*;
use xodiumweb::{App, apply_reduced_motion_class, expose_mcp_tools};

fn main() {
    console_error_panic_hook::set_once();
    apply_reduced_motion_class();
    mount_to_body(App);
    expose_mcp_tools();
}
