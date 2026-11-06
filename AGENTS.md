# xodium.org — Claude Code Context

## Project at a Glance

- **Name:** xodiumweb
- **Type:** Static website (WASM)
- **Framework:** Leptos (CSR - Client Side Rendering)
- **Build Tool:** Trunk
- **Language:** Rust (Edition 2024)
- **Target:** WebAssembly (`wasm32-unknown-unknown`)
- **Deployment:** Cloudflare Pages

## APIs & Tools

| Category          | Technology                    | Purpose                         |
| ----------------- | ----------------------------- | ------------------------------- |
| **Framework**     | Leptos (CSR)                  | Reactive web framework          |
| **Build Tool**    | Trunk                         | WASM bundler + dev server       |
| **Styling**       | Tailwind CSS + DaisyUI        | Utility-first CSS               |
| **HTTP Client**   | gloo-net                      | Fetch API wrapper for WASM      |
| **JSON**          | serde + serde_json            | Serialization                   |
| **JS Interop**    | wasm-bindgen, js-sys, web-sys | Browser API bindings            |
| **Timers**        | gloo-timers                   | Async timers                    |
| **Panic Handler** | console_error_panic_hook      | Debug panic messages in console |
| **Docs**          | rustdoc (via `cargo doc`)     | API documentation               |

### Leptos Resources

- **Book**: https://book.leptos.dev/
- **API Docs**: https://docs.rs/leptos/
- **Examples**: https://github.com/leptos-rs/leptos/tree/main/examples

### Trunk Resources

- **Documentation**: https://trunkrs.dev/
- **Quick Start**: `trunk serve` (dev), `trunk build --release` (production)

## Quick Commands

```bash
# Serve locally with hot-reload
trunk serve

# Build for release (output: dist/)
trunk build --release

# Generate Rust documentation
cargo doc --no-deps

# Generate docs and fail on broken intra-doc links / doc warnings
RUSTDOCFLAGS="-D warnings" cargo doc --no-deps --target wasm32-unknown-unknown

# Clean build artifacts
trunk clean

# Run browser-based WASM tests (requires wasm-pack + Firefox)
wasm-pack test --headless --firefox

# Check for unused crate dependencies
cargo machete

# Verify repository paths named in Markdown files exist
sh scripts/check-md-paths.sh

# Lint with pedantic lints enabled; every warning is treated as an error.
cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings
```

These also exist as `just` recipes (`just lint`, `just fmt-check`, `just deps-check`, `just docs-check`, `just test`, `just doc`, `just build`, `just serve`, `just size`, `just validate`); see `just --list`.

The `justfile` works on Windows and Unix: it defaults to `sh` and switches to
PowerShell via `[windows]`. Recipes whose shell syntax differs (e.g. `size`) are
defined twice under `[unix]` and `[windows]`; shared paths live in
platform-neutral variables at the top of the file.

## Architecture Overview

### Entry Points

| File      | Purpose                                         |
| --------- | ----------------------------------------------- |
| `main.rs` | WASM entry point, mounts `App` to `<body>`      |
| `lib.rs`  | Crate root; declares every module and re-export |
| `app.rs`  | Root `App` component with full page layout      |

### Page Layout (`App` component)

The single-page application is a blueprint-style drawing with a fixed corner
stack of metadata and controls:

All of this is wrapped in a single `<div class="blueprint-frame">` in
`app.rs`:

1. **Skip Link** — accessibility anchor to `#main-content`
2. **`Main`** (`<main id="main-content">`) — accessible page heading and the
   container the redesigned content will mount into. It currently renders no
   sections.
3. **Corner stack** (`<aside class="corner-stack">`, assembled by `Header`) —
   fixed bottom-right metadata panel:
    - `AsciiArt` — XODIUM glyph mark
    - separator line (`<hr class="corner-stack-sep">`)
    - `LegendBlock` — keyboard shortcut legend
    - `LinkBadges` + `TitleBlock` — external links and sheet metadata
4. **`Footer`** — fixed bottom-left copyright / navigation links

### Component Organization

Components are grouped by function in `src/components/`:

#### Sections (`src/components/sections/`)

| Component | File        | Purpose                                                        |
| --------- | ----------- | -------------------------------------------------------------- |
| `Main`    | `main.rs`   | Accessible page heading; currently mounts no content sections  |
| `Team`    | `team.rs`   | Team member section with large round avatars (not mounted yet) |
| `Header`  | `header.rs` | Bottom-right corner stack assembly                             |
| `Footer`  | `footer.rs` | Bottom-left site footer                                        |

#### UI Primitives (`src/components/ui/`)

| Component     | File              | Purpose                                          |
| ------------- | ----------------- | ------------------------------------------------ |
| `AsciiArt`    | `ascii_art.rs`    | XODIUM ASCII glyph mark                          |
| `LegendBlock` | `legend_block.rs` | Keyboard shortcut legend                         |
| `LinkBadges`  | `link_badges.rs`  | External link icons (GitHub, Buy Me a Coffee)    |
| `TitleBlock`  | `title_block.rs`  | Blueprint metadata table (sheet, DPR, rev, date) |

#### UI Icons (`src/components/ui/icons/`)

| Component          | File                 | Purpose             |
| ------------------ | -------------------- | ------------------- |
| `BuyMeACoffeeIcon` | `buy_me_a_coffee.rs` | Buy Me a Coffee cup |
| `GitHubIcon`       | `github.rs`          | GitHub Octocat      |

### GitHub API (`src/github.rs`)

Centralized data fetching with `localStorage` caching. The only public
entry point is `fetch_members()`:

| Function          | Endpoints                                                                    | Cache TTL |
| ----------------- | ---------------------------------------------------------------------------- | --------- |
| `fetch_members()` | `/orgs/XodiumSoftware/members` and `/orgs/XodiumSoftware/members?role=admin` | 5 minutes |

`fetch_members` labels each member `Owner` when their login appears in the
admin-member response, and `Member` otherwise. If the admin request fails it
logs a warning and labels everyone `Member` rather than failing the whole
call.

**Internal helpers:**

- `fetch<T>(endpoint)` — cache-then-network with retry logic (`MAX_RETRIES + 1` attempts, exponential backoff from 1 s)
- `fetch_all<T>(endpoint)` — paginates `fetch` with `?page=N&per_page=100` until a short page is returned
- `LocalResource` used for async (runs on WASM thread)
- `xodium:v{CACHE_SCHEMA_VERSION}:{endpoint}` cache key format; timestamps live in a sibling `{key}:ts` entry. Bump `CACHE_SCHEMA_VERSION` when a cached payload type changes shape.

### Project Structure

```
src/
├── main.rs                    # WASM entry point
├── lib.rs                     # Crate root, module declarations and re-exports
├── app.rs                     # Root App component
├── github.rs                  # GitHub API client
├── utils.rs                   # Shared utilities
├── components/
│   ├── sections/              # Page sections
│   │   ├── main.rs
│   │   ├── team.rs
│   │   ├── header.rs
│   │   └── footer.rs
│   └── ui/                    # UI primitives and icons
│       ├── ascii_art.rs
│       ├── icons/
│       │   ├── buy_me_a_coffee.rs
│       │   └── github.rs
│       ├── legend_block.rs
│       ├── link_badges.rs
│       └── title_block.rs

public/
├── style.css                  # Tailwind + custom blueprint theme
├── favicon.svg                # Site icon
└── _headers                   # Cloudflare Pages response headers

index.html                     # Trunk entry template
Trunk.toml                     # Trunk configuration
```

### Key Conventions

- **Register modules and re-exports in `src/lib.rs` explicitly.** Do not use `mod.rs` files. The crate root declares the module tree inside inline `pub mod components { pub mod sections { .. } pub mod ui { .. } }` blocks. Use `#[path = "..."]` attributes when a module file lives in a subdirectory and cannot be reached by the conventional module path.
- All Clippy warnings enabled; run with `-W clippy::pedantic -D warnings` to catch pedantic lints as errors.
- `missing_docs` is enabled in `Cargo.toml` under `[lints.rust]` as `"deny"`, so a public item without a rustdoc comment fails `cargo build`, `trunk build`, and `just lint` alike. Every public module, type, function, and field must have a rustdoc comment.
- No `unsafe` code (`unsafe_code = "deny"`).
- `on_cleanup` requires a `Send + Sync` closure, so it cannot capture raw
  `Closure<dyn FnMut(..)>` handles. Call `.into_js_value()` and keep the
  resulting `js_sys::Function` instead — that type is `Send + Sync`, so no
  extra dependency is needed for listener cleanup.
- **Props:** `#[derive(Clone)]` structs named `{Component}Properties` (e.g. `TeamProperties`)
- **Async data:** Use `LocalResource` (not `Resource`) for WASM thread execution
- **External links:** Always use `target="_blank" rel="noopener noreferrer"`
- **Static data:** Define `const` slices at top of component files
- **CSS:** Tailwind utility classes via `style.css`; custom component styles live in `public/style.css`
- **Do not add `//` line comments.** Use `///` doc comments (or `//!` module docs) to explain intent; keep the code itself self-documenting. This applies to `view!` macro blocks too — meaningful intent in a template should live on the component's or helper's doc comment, not as a structural label inside the view.

### Component Patterns

**Props struct:**

```rust
#[derive(Clone)]
pub struct TeamProperties {
    pub members: Vec<Member>,
    pub on_close: Rc<dyn Fn() + 'static>,
}
```

**Async data with LocalResource:**

GitHub members were previously fetched in `Main`. Nothing fetches them now;
when a section needs them, use:

```rust
let members =
    LocalResource::new(move || async move { fetch_members().await.unwrap_or_default() });
```

### Build Pipeline

1. **Trunk** bundles WASM, processes Tailwind CSS, copies the `public/` assets declared via `data-trunk` links in `index.html` → `dist/`
    - `Trunk.toml` pins the `tailwindcss` tool version. This is the version of Trunk’s bundled Tailwind distribution (`dobicinaitis/tailwind-cli-extra`), not the upstream Tailwind CSS version. The bundle includes the latest Tailwind CSS + DaisyUI; the actual Tailwind CSS version resolved at build time is shown in the build log (e.g. `tailwindcss v4.2.2`).
    - Renovate manages this version via a custom regex manager in `.github/renovate.json`; the TOML line is annotated with `# renovate: datasource=github-releases depName=dobicinaitis/tailwind-cli-extra`.
2. **Cargo release profile** optimizations:
    - `opt-level = "z"` (size)
    - `lto = true` (link-time optimization)
    - `codegen-units = 1` (single codegen unit)
    - `panic = "abort"` (no unwinding)
    - `strip = true` (remove symbols)

### Team Section

`Team` is intentionally **not** mounted by the page. `Main` no longer fetches
members or owns a close signal, so the two are decoupled for the redesign:
the caller that eventually renders `Team` is responsible for fetching members
via `fetch_members` and for supplying the `on_close` callback. The component
still ships and is exercised by no one yet — do not assume it appears on the
page.

When mounted, it shows each member as a large round avatar linking to their
GitHub profile in a new tab.

- The `Team` component manages its own focus: it focuses the card on mount,
  closes on Escape via a document-level listener (so focus position does not
  matter), and restores focus to the previously active element on cleanup
- Clicking the backdrop or pressing Escape calls the `on_close` callback

### Keyboard Shortcuts

Global shortcuts handled in `LinkBadges`:

| Shortcut  | Action               |
| --------- | -------------------- |
| `Alt + 1` | Open Cadiotheka      |
| `Alt + G` | Open GitHub org page |
| `Alt + C` | Open Buy Me a Coffee |

### Caching Strategy

GitHub API responses cached in `localStorage`:

- Key: `xodium:v1:{endpoint}`
- Timestamp: `{key}:ts`
- TTL: 5 minutes
- Cache is invalidated after TTL; the next successful fetch refreshes it
- Schema version: bump `CACHE_SCHEMA_VERSION` in `github.rs` when a cached
  payload type changes shape, so old entries are ignored by construction
- Poisoned entries: a payload that fails to deserialize is deleted along with
  its timestamp, so one bad entry costs a single fetch
- Stale-if-error: if all refresh attempts fail, an expired entry is still served (with a console warning) instead of showing an error

## Testing

- **Browser-based WASM tests** (`wasm-bindgen-test`, `run_in_browser`) live
  alongside the code in `src/github.rs`
- Run them with `wasm-pack test --headless --firefox` (or `just test`); the
  `justfile` and CI `test` job use Firefox
- Also verify manually with `trunk serve`; check the console for WASM panics
  (in debug builds)

## Important Notes

- **CSR only** — no SSR, all rendering happens client-side
- **Browser APIs** accessed via `web-sys` and `js-sys`
- **GitHub API** has rate limits (60 req/hour unauthenticated)
- **Cache invalidation** — manual refresh or wait for 5-min TTL
- **WASM size** optimized heavily for fast page loads
- **`prefers-reduced-motion`** — handled entirely in `public/style.css` via
  the `@media (prefers-reduced-motion: reduce)` block, which zeroes out the
  page and corner-stack entry animations. No Rust code toggles a class for
  this.

## Claude Code Workflow

### Task Management

**When creating tasks:**

- Number tasks in the name (e.g., "1. Add new shortcut", "2. Update TeamAvatars styling")

**After completing each task:**

- Ask the user if they want to git commit the changes or adjust before committing

**When all tasks in a worktree are complete:**

- Ask the user if they want to git publish (push) the changes or adjust before publishing

### After Making Edits

**Always update documentation when code changes:**

1. **rustdoc comments** — Add/update if you:
    - Add new public APIs
    - Change component interfaces
    - Add complex logic
    - **Run `trunk build`** to verify compilation
    - **Update `AGENTS.md`** if architecture, layout, or conventions change

**Rule of thumb:** If a code change would confuse someone reading the docs, update the docs.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **rust.yml** — Lint (clippy + fmt + rustdoc + Markdown path check + cargo-machete), browser WASM tests, Trunk build with a 500 KB WASM size budget, deploy to Cloudflare Pages (pushes to `main`/`dev` and manual dispatches only)
- **enforce_pr_title.yml** — Validates PR titles follow conventional commits

## Documentation Checks

`scripts/check-md-paths.sh` (run by `just docs-check`, `just validate`, and
CI) verifies that every repository path cited in a `.md` file still exists. It
only checks inline-code tokens that contain a path separator and start with a
known top-level directory (`src/`, `public/`, `scripts/`, `.github/`,
`.agents/`). Bare filenames, fenced code blocks, and template paths containing
`{`, `*`, or `<` are skipped: AGENTS.md lists bare filenames in tables headed by
directory, skill files contain `{name}.rs` placeholders, and a `mod.rs` may be
cited precisely because it does not exist.

This catches renamed or deleted files, not stale prose: no linter can tell
that a sentence describes behaviour that no longer exists.

## Adding a New Section

To add a new page section:

1. Create file in `src/components/sections/{section}.rs`
2. Define `{Section}` component with the `#[component]` macro
3. Add the `pub mod {section};` declaration inside `pub mod components { pub mod sections { .. } }` in `src/lib.rs`
4. Add a `pub use sections::{section}::{Section};` re-export next to the other
   `pub use sections::..` lines in `src/lib.rs`
5. Import it (`crate::components::sections::..` or the re-exported path) in
   `src/app.rs` and add it to the `App` view

### Adding a New Component

1. Determine category (`sections` or `ui`, plus `ui/icons` for icons)
2. Create file in the appropriate subdirectory
3. Define component with props struct named `{Component}Properties` where applicable
4. Add the module declaration in `src/lib.rs` under the appropriate block
5. Add a re-export in `src/lib.rs`
6. Add rustdoc comments explaining purpose
7. Update `AGENTS.md` architecture tables if the component is part of the page layout

## Memory System

This project uses Claude Code's persistent memory in `.claude/memory/`. These files persist across sessions and different PCs. Review `MEMORY.md` for existing context about the user and project.
