---
name: trunk-deploy
description: Build and deploy the xodium.org Leptos WASM site using Trunk, with release optimizations and Cloudflare Pages deployment checks.
---

# Build and Deploy xodium.org

Use this skill when the user wants to build, preview, or deploy the xodium.org site.

## Local Development

Run the dev server with hot reload:

```bash
trunk serve
```

## Production Build

Build the optimized WASM bundle into `dist/`:

```bash
trunk build --release
```

The release profile in `Cargo.toml` already applies size optimizations:

- `opt-level = "z"`
- `lto = true`
- `codegen-units = 1`
- `panic = "abort"`
- `strip = true`

## Clean Build

If something seems off, clean and rebuild:

```bash
trunk clean
trunk build --release
```

## Pre-deployment Checklist

Before considering the site ready to deploy:

1. `just lint` — `cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings` — passes clean.
2. `just test` — `wasm-pack test --headless --chrome` — passes (the suite under `src/github.rs`).
3. `trunk build --release` completes with no errors or warnings.
4. The resulting `dist/*_bg.wasm` stays under the CI's 500 KB size budget.
5. Browser console has no WASM panics when running `trunk serve`.

## Cloudflare Pages

Deployment runs through `.github/workflows/rust.yml`. The workflow's `deploy` job takes the built `dist/` artifact and publishes it to Cloudflare Pages via Wrangler (`pages deploy dist --project-name=xodiumorg`). It triggers on pushes to `main` and `dev` and on manual dispatches.

Do not modify deployment secrets or workflow credentials. If the workflow changed, verify the build still produces a `dist/` directory before Wrangler runs.

## Troubleshooting

- **`trunk serve` hangs** — check for interactive prompts in the build or a missing `index.html`.
- **WASM panics in the browser console** — they're truncated in release builds (`panic = "abort"`); do a local `trunk build` (dev profile) for readable messages.
- **Bundle too large** — check `cargo machete` for unused dependencies first; otherwise inspect what's actually being included (e.g. `console_error_panic_hook` is tiny, but new transitive deps appear quickly when you add helpers).
- **Post-build hooks failing on Windows** — there are no shell hooks anymore; if `sh` / `cmd` shows in the error, you've reintroduced one. `Trunk.toml` should stay hook-free.
