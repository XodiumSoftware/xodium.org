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

1. `cargo clippy --all-targets --all-features -- -D warnings` passes with no warnings.
2. `trunk build --release` completes with no errors or warnings.
3. `cargo doc --no-deps` generates docs if public APIs changed.
4. `ARCHITECTURE.md` is up to date if layout, components, or API behavior changed.
5. Browser console has no WASM panics when running `trunk serve`.
6. GitHub API rate limit is respected; cache behavior is verified if changed.

## Cloudflare Pages

Deployment is handled by `.github/workflows/build.yml`. The workflow:
- Builds the WASM bundle with Trunk.
- Uploads the `dist/` output to Cloudflare Pages.

Do not modify deployment secrets or workflow credentials. If the build workflow changed, verify it still runs `trunk build --release`.

## Troubleshooting

- If `trunk serve` hangs, check for interactive prompts or missing `index.html`.
- If WASM panics appear in the browser console, use a debug build to see full messages.
- If the bundle is too large, review release profile settings and remove unused dependencies.
