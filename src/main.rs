//! WASM entry point for xodiumweb.
//!
//! Mounts the root [`App`] component to `<body>` and installs a panic hook
//! that forwards Rust panics to the browser console.

use leptos::prelude::*;
use xodiumweb::App;

fn main() {
    console_error_panic_hook::set_once();
    mount_to_body(App);
}
