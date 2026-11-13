# Install `just` once: https://github.com/casey/just

[windows]
set shell := ["powershell.exe", "-NoProfile", "-Command"]

_default:
    @just --list

_dist := "dist"
_wasm := "target/wasm32-unknown-unknown/release/xodiumweb.wasm"

lint:
    cargo clippy --all-targets --all-features -- -W clippy::pedantic -D warnings

fmt-check:
    cargo fmt --all -- --check

fmt:
    cargo fmt --all

test:
    cargo test --target wasm32-unknown-unknown --no-run

build:
    trunk build --release

serve:
    trunk serve

clean:
    trunk clean

deps-check:
    cargo machete

[unix]
size: build
    ls -l {{ _wasm }}

[windows]
size: build
    Get-Item "{{ _wasm }}" | Select-Object Name, Length

[unix]
doc:
    RUSTDOCFLAGS="-D warnings" cargo doc --no-deps

[windows]
doc:
    $env:RUSTDOCFLAGS = "-D warnings"; cargo doc --no-deps

[windows]
validate: lint fmt-check deps-check doc build
