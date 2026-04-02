use std::fs;
use std::process::Command;
use std::time::{SystemTime, UNIX_EPOCH};

const DAISYUI_VERSION: &str = "5.5.19";
const SENTINEL: &str = "public/.daisyui-version";

fn fetch_daisyui() {
    if fs::read_to_string(SENTINEL).unwrap_or_default().trim() == DAISYUI_VERSION {
        return;
    }

    let base = format!("https://github.com/saadeghi/daisyui/releases/download/v{DAISYUI_VERSION}");

    println!("cargo:warning=Fetching daisyui v{DAISYUI_VERSION}...");

    for file in &["daisyui.mjs", "daisyui-theme.mjs"] {
        let url = format!("{base}/{file}");
        let body = ureq::get(&url)
            .call()
            .unwrap_or_else(|e| panic!("Failed to fetch {url}: {e}"))
            .body_mut()
            .read_to_string()
            .unwrap_or_else(|e| panic!("Failed to read {url}: {e}"));
        fs::write(format!("public/{file}"), body)
            .unwrap_or_else(|e| panic!("Failed to write {file}: {e}"));
    }

    fs::write(SENTINEL, DAISYUI_VERSION).expect("Failed to write sentinel");
}

fn main() {
    fetch_daisyui();

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
