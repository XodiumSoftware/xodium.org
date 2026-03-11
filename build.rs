use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let build = Command::new("git")
        .args(["rev-list", "--count", "HEAD"])
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map(|s| s.trim().to_string())
        .unwrap_or_else(|| "0".to_string());

    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    let year = (1970 + secs / 31_557_600) % 100;

    println!("cargo:rustc-env=APP_VERSION={year}.{build}");
    println!("cargo:rerun-if-changed=.git/HEAD");
    println!("cargo:rerun-if-changed=.git/refs/heads");
}
