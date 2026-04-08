use leptos::prelude::*;
use xodiumweb::App;

fn main() {
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();
    mount_to_body(App);
}
