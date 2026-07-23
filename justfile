# xodium.org task runner
# Install `just` once: https://github.com/casey/just

_default:
    @just --list

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
# Note: requires wasm-pack and a headless browser (e.g. Chrome)
test:
    wasm-pack test --headless --chrome

# Build the release WASM bundle with Trunk
build:
    trunk build --release

# Serve locally with hot-reload
serve:
    trunk serve

# Clean build artifacts
clean:
    trunk clean

# Run the full validation suite used in CI
validate: lint fmt-check build
