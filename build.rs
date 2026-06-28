use leptos_i18n_build::{Config, TranslationsInfos};
use std::path::PathBuf;
use std::process::Command;

fn main() {
    // Generate i18n module from locales/
    let i18n_mod_directory =
        PathBuf::from(std::env::var_os("OUT_DIR").expect("OUT_DIR should be set")).join("i18n");
    let cfg = Config::new("en").expect("default locale 'en' should be valid");
    let translations_infos =
        TranslationsInfos::parse(cfg).expect("locales should parse successfully");
    translations_infos.emit_diagnostics();
    translations_infos.rerun_if_locales_changed();
    translations_infos
        .generate_i18n_module(i18n_mod_directory)
        .expect("i18n module should generate successfully");

    let git_sha = Command::new("git")
        .args(["rev-parse", "--short", "HEAD"])
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .map_or_else(|| "unknown".to_string(), |s| s.trim().to_string());

    let is_dirty = Command::new("git")
        .args(["status", "--porcelain"])
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .is_some_and(|s| !s.trim().is_empty());

    let version = if is_dirty {
        format!("{git_sha}-dirty")
    } else {
        git_sha
    };

    println!("cargo:rustc-env=GIT_SHA={version}");
    println!("cargo:rerun-if-changed=.git/HEAD");
    println!("cargo:rerun-if-changed=.git/refs/heads");
}
