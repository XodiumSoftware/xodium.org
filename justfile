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
    wasm-pack test --headless --firefox

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

[unix]
docs-check:
    sh scripts/check-md-paths.sh

[windows]
docs-check:
    $sh = Get-Command sh -ErrorAction SilentlyContinue; if ($sh) { $sh = "$sh" } else { $sh = Join-Path (Split-Path -Parent (Get-Command git).Path) "sh.exe" }; & $sh scripts/check-md-paths.sh; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

validate: lint fmt-check deps-check docs-check test doc build
