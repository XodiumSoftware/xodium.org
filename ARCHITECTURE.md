# ARCHITECTURE.md

This file provides guidance when working with code in this repository.

## Project Overview

xodium.org is the Xodium Software organization website. Built with Rust + Leptos (CSR), compiled to WebAssembly via Trunk, and deployed to Cloudflare Pages.

## Build & Run Commands

```bash
# Build for release (output: dist/)
trunk build --release

# Serve locally with hot-reload
trunk serve
```

There are no automated tests in this project.

## Architecture

### Entry Points

- **`main.rs`** — WASM entry point. Installs `console_error_panic_hook` in debug builds, then mounts two Leptos component trees to `<body>`: `App` (the full page layout) and `Version` (a fixed bottom-left version badge driven by the `APP_VERSION` env var).
- **`lib.rs`** — Crate root. Declares `app`, `components`, and `github` modules and re-exports everything from each so downstream code can use flat `use xodiumweb::*` imports.

### Page Layout

`App` composes the full single-page layout in this order:

1. `Header` — sticky navbar
2. `#landing` section — decorative `Grid` background + gradient blobs + `Typewriter` hero text + CTA buttons
3. `#projects` section — `ProjectGrid`
4. `#team` section — `TeamGrid`
5. `Footer`

### Component Inventory (`src/components/`)

| Component     | File             | Role                                                                                                                                                                                                                                            |
|---------------|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Header`      | `header.rs`      | Sticky navbar; turns frosted-glass on scroll via a `scroll` event listener cleaned up with `on_cleanup`. Renders `SOCIAL_LINKS` (a `const` slice of `SocialLink` structs) as masked-icon nav items.                                             |
| `Footer`      | `footer.rs`      | Copyright line (year from `js_sys::Date`) + `FOOTER_LINKS` nav.                                                                                                                                                                                 |
| `Grid`        | `grid.rs`        | Purely decorative full-bleed CSS grid background; `pointer-events: none`.                                                                                                                                                                       |
| `Version`     | `version.rs`     | Fixed bottom-left version badge; only visible at `2xl` breakpoint.                                                                                                                                                                              |
| `Typewriter`  | `typewriter.rs`  | Animated hero text. Accepts `TypewriterProperties` (word list, speed, pause durations, loop, unwrite). Drives three `RwSignal`s (`letter_index`, `current_word_index`, `is_deleting`) from an async `typewrite_loop` spawned via `spawn_local`. |
| `ProjectGrid` | `projectgrid.rs` | Fetches repos via `LocalResource` → `fetch_repos()`, renders them through `data_grid` into a 1/2/3-column CSS grid of `ProjectCard`s.                                                                                                           |
| `TeamGrid`    | `teamgrid.rs`    | Fetches members via `LocalResource` → `fetch_members()`, renders them through `data_grid` into a `<ul>` of `TeamCard`s.                                                                                                                         |
| `ProjectCard` | `projectcard.rs` | Card for a single repo: name, description, language badge (`language_color` maps language strings to hex Tailwind classes), star count.                                                                                                         |
| `TeamCard`    | `teamcard.rs`    | Member avatar + login linking to their GitHub profile.                                                                                                                                                                                          |
| `data_grid`   | `datagrid.rs`    | Generic `Suspense` wrapper used by both grids. Handles three states: loading spinner, error message, empty message, and — on success — calls the caller-supplied `render` closure.                                                              |

### GitHub API (`src/github.rs`)

All GitHub data fetching is centralized here.

**Public surface:**

- `fetch_members() -> Result<Vec<Member>, String>` — paginates `GET /orgs/XodiumSoftware/members`.
- `fetch_repos() -> Result<Vec<Repo>, String>` — paginates `GET /orgs/XodiumSoftware/repos?type=public`, then filters out forks and sorts descending by `stargazers_count`.

**Internal helpers:**

- `fetch<T>(endpoint)` — cache-then-network. Checks `localStorage` first (key `xodium:{endpoint}`, TTL 5 min via a companion `{key}:ts` entry). On miss, retries up to `MAX_RETRIES` (3) times with exponential backoff starting at 1 s (`RETRY_BASE_MS << attempt`). Only retries on HTTP 5xx; other non-OK responses return immediately.
- `fetch_all<T>(endpoint)` — calls `fetch` in a loop with `page` and `per_page=100` query params until a page returns fewer items than `PER_PAGE`.

**Constants:** `ORG`, `API_BASE`, `CACHE_TTL_MS` (5 min), `MAX_RETRIES` (3), `RETRY_BASE_MS` (1 000 ms), `PER_PAGE` (100).

### Props Convention

Component properties are plain `#[derive(Clone)]` structs named `{Component}Properties` (e.g. `ProjectCardProperties`, `TeamCardProperties`, `TypewriterProperties`). They are passed as a single `props` parameter. `Version` is the exception — it takes a single `&'static str` directly via the `#[prop]` generated by Leptos.

### Build Pipeline

1. **Pre-build hook** (`Trunk.toml`) — `scripts/fetch-daisyui.sh` downloads the DaisyUI CSS bundle before Trunk runs.
2. **Trunk** — bundles the WASM binary, runs Tailwind CSS 4.x, copies static assets from `public/` to `dist/`.
3. **wasm-opt** — Trunk applies wasm-opt at level `z` (size-optimised).
4. **Cargo release profile** — `opt-level = "z"`, `lto = true`, `codegen-units = 1`, `panic = "abort"`, `strip = true`.

### CI/CD

GitHub Actions (`.github/workflows/build.yml`) runs on pushes to `main` and `dev`:

1. Checkout → setup stable Rust toolchain with `wasm32-unknown-unknown` target → restore Rust cache.
2. Install Trunk via `jetli/trunk-action`.
3. `trunk build --release` → `dist/`.
4. Deploy `dist/` to Cloudflare Pages project `xodiumorg` via `cloudflare/wrangler-action`, using the current branch name as the Pages branch.

### Key Conventions

- All data fetching uses `LocalResource` (not `Resource`) so async futures run on the WASM thread.
- `Suspense` is always provided by the `data_grid` helper — do not inline ad-hoc suspense boundaries in grids.
- Static link/icon tables are `const` slices of plain structs (e.g. `SOCIAL_LINKS`, `FOOTER_LINKS`) defined at the top of their respective component files.
- External links always carry `target="_blank" rel="noopener noreferrer"`.
- CSS is Tailwind 4 + DaisyUI utility classes; no CSS Modules or scoped styles except the inline `<style>` block in `Typewriter` for the cursor blink animation.
