# xodium.org task runner
# Install `just` once: https://github.com/casey/just

[windows]
set shell := ["powershell.exe", "-NoProfile", "-Command"]

_default:
    @just --list

# ── Cross-platform paths (pure `just` functions) ──

_dist := "dist"
_wasm := "target/wasm32-unknown-unknown/release/xodiumweb.wasm"

# Lint with pedantic lints enabled and warnings as errors
lint:
    cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings

# Check formatting
fmt-check:
    cargo fmt --all -- --check

# Format the project
fmt:
    cargo fmt --all

# Run browser-based WASM tests
# Note: requires wasm-pack and a headless browser (Firefox)
test:
    wasm-pack test --headless --firefox

# Build the release WASM bundle with Trunk
build:
    trunk build --release

# Serve locally with hot-reload
serve:
    trunk serve

# Clean build artifacts
clean:
    trunk clean

# Check for unused crate dependencies
deps-check:
    cargo machete

# Verify the release WASM bundle exists and report its size
[unix]
size: build
    ls -l {{ _wasm }}

[windows]
size: build
    Get-Item "{{ _wasm }}" | Select-Object Name, Length

# Run the full validation suite used in CI
validate: lint fmt-check deps-check test build
