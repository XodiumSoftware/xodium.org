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

# Clean build artifacts
trunk clean

# Run browser-based WASM tests (requires wasm-pack + Firefox)
wasm-pack test --headless --firefox

# Check for unused crate dependencies
cargo machete

# Lint with pedantic lints enabled; every warning is treated as an error.
cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings
```

These also exist as `just` recipes (`just lint`, `just fmt-check`, `just deps-check`, `just test`, `just build`, `just serve`, `just validate`); see `just --list`.

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

1. **Skip Link** — accessibility anchor to `#main-content`
2. **`main#content`** — full-viewport drawing viewport containing the
   isometric `Object3dScene` and the `Team` modal, rendered by the `Main`
   section component
3. **Corner stack** (`<aside class="corner-stack">`) — fixed bottom-right
   metadata panel:
    - `AsciiArt` — XODIUM glyph mark
    - separator line
    - `LegendBlock` — keyboard shortcut legend
    - `LinkBadges` + `TitleBlock` — external links and sheet metadata
4. **`Team`** — centered team dialog opened by the "Team" object in the
   isometric scene, showing `TeamAvatars`
5. **`Footer`** — fixed bottom-left copyright / revision link

### Component Organization

Components are grouped by function in `src/components/`:

#### Sections (`src/components/sections/`)

| Component | File        | Purpose                             |
| --------- | ----------- | ----------------------------------- |
| `Main`    | `main.rs`   | Central isometric drawing viewport  |
| `Team`    | `team.rs`   | Team modal opened from the 3D scene |
| `Header`  | `header.rs` | Bottom-right corner stack assembly  |
| `Footer`  | `footer.rs` | Bottom-left site footer             |

#### Scenes (`src/components/scenes/`)

| Component       | File                 | Purpose                          |
| --------------- | -------------------- | -------------------------------- |
| `Object3dScene` | `object_3d_scene.rs` | Hosts isometric `Object3d` items |

#### UI Primitives (`src/components/ui/`)

| Component     | File              | Purpose                                          |
| ------------- | ----------------- | ------------------------------------------------ |
| `AsciiArt`    | `ascii_art.rs`    | XODIUM ASCII glyph mark                          |
| `LegendBlock` | `legend_block.rs` | Keyboard shortcut legend                         |
| `LinkBadges`  | `link_badges.rs`  | External link icons (GitHub, Buy Me a Coffee)    |
| `Object3d`    | `object_3d.rs`    | Isometric wireframe block and shape registry     |
| `TeamAvatars` | `team_avatars.rs` | GitHub org member avatar group                   |
| `TitleBlock`  | `title_block.rs`  | Blueprint metadata table (sheet, DPR, rev, date) |

#### UI Icons (`src/components/ui/icons/`)

| Component          | File                 | Purpose             |
| ------------------ | -------------------- | ------------------- |
| `BuyMeACoffeeIcon` | `buy_me_a_coffee.rs` | Buy Me a Coffee cup |
| `GitHubIcon`       | `github.rs`          | GitHub Octocat      |

### GitHub API (`src/github.rs`)

Centralized data fetching with `localStorage` caching:

| Function          | Endpoint                                 | Cache TTL |
| ----------------- | ---------------------------------------- | --------- |
| `fetch_members()` | `/orgs/XodiumSoftware/members`           | 5 minutes |
| `fetch_repos()`   | `/orgs/XodiumSoftware/repos?type=public` | 5 minutes |

**Internal helpers:**

- `fetch<T>(endpoint)` — cache-then-network with retry logic (4 attempts, exponential backoff)
- `fetch_all<T>(endpoint)` — paginates `fetch` with `?page=N&per_page=100` until a short page is returned
- `LocalResource` used for async (runs on WASM thread)
- `xodium:{endpoint}` cache key format

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
│   ├── scenes/                # Viewport scenes
│   │   └── object_3d_scene.rs
│   └── ui/                    # UI primitives and icons
│       ├── ascii_art.rs
│       ├── icons/
│       │   ├── buy_me_a_coffee.rs
│       │   └── github.rs
│       ├── legend_block.rs
│       ├── link_badges.rs
│       ├── object_3d.rs
│       │   ├── cuboid.rs
│       │   ├── dimensions.rs
│       │   ├── pyramid.rs
│       │   └── triangular_prism.rs
│       ├── team_avatars.rs
│       ├── team_modal.rs
│       └── title_block.rs

public/
├── style.css                  # Tailwind + custom blueprint theme
└── icons/                     # SVG icons

index.html                     # Trunk entry template
Trunk.toml                     # Trunk configuration
```

### Key Conventions

- **Register modules and re-exports in `src/lib.rs` explicitly.** Do not use `mod.rs` files. The crate root declares the top-level module tree; nested `pub mod` declarations are allowed inside module root files (e.g. `object_3d.rs` declares `pub mod cuboid;`). Use `#[path = "..."]` attributes when a module file lives in a subdirectory and cannot be reached by the conventional module path.
- All Clippy warnings enabled; run with `-W clippy::pedantic -D warnings` to catch pedantic lints as errors.
- `missing_docs` is enabled in `Cargo.toml` under `[lints.rust]`. Every public module, type, function, and field must have a rustdoc comment.
- No `unsafe` code — where JS handles must satisfy `Send + Sync` (e.g. for `on_cleanup`), use `send_wrapper::SendWrapper`
- **Props:** `#[derive(Clone)]` structs named `{Component}Properties` (e.g. `Object3dProperties`)
- **Async data:** Use `LocalResource` (not `Resource`) for WASM thread execution
- **External links:** Always use `target="_blank" rel="noopener noreferrer"`
- **Static data:** Define `const` slices at top of component files
- **CSS:** Tailwind utility classes via `style.css`; custom component styles live in `public/style.css`
- **Do not add `//` line comments.** Use `///` doc comments (or `//!` module docs) to explain intent; keep the code itself self-documenting. This applies to `view!` macro blocks too — meaningful intent in a template should live on the component's or helper's doc comment, not as a structural label inside the view.

### Component Patterns

**Props struct:**

```rust
#[derive(Clone)]
pub struct Object3dProperties {
    pub id: &'static str,
    pub name: &'static str,
    pub shape: Shape,
    pub attached_to: Option<Attachment>,
    pub resolved_position: Option<Position>,
    pub depth_index: Option<i32>,
    pub colors: Option<FaceColors>,
    pub is_draft: bool,
    pub url: Option<&'static str>,
    pub on_click: Option<Rc<dyn Fn() + 'static>>,
}
```

**Async data with LocalResource:**

```rust
let repos = LocalResource::new(move || async move {
    fetch_repos().await.unwrap_or_default()
});
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

### 3D Scene

The viewport uses a static isometric scene (`Object3dScene`). Objects are
positioned via `Attachment` to faces of earlier objects and are
centered as a group. Each `Object3d` renders an SVG wireframe block with a
clickable target that opens its `url` or, if `on_click` is provided, runs a
custom in-app action.

- `Object3dProperties` defines id, name, shape, attachment, colors, draft mode, optional URL, and optional `on_click` callback
- Shapes implement the shared `Dimensions` trait (`src/components/ui/object_3d/dimensions.rs`) and expose a `render()` method
- `Shape::render()` dispatches to the appropriate shape renderer
- Team data can be rendered in the scene via the `TeamAvatars` component (fetched from `fetch_members()`)

### Keyboard Shortcuts

Global shortcuts handled in `LinkBadges`:

| Shortcut  | Action               |
| --------- | -------------------- |
| `Alt + 1` | Open Cadiotheka      |
| `Alt + G` | Open GitHub org page |
| `Alt + C` | Open Buy Me a Coffee |

### Caching Strategy

GitHub API responses cached in `localStorage`:

- Key: `xodium:{endpoint}`
- Timestamp: `{key}:ts`
- TTL: 5 minutes
- Cache is invalidated after TTL; the next successful fetch refreshes it
- Stale-if-error: if all refresh attempts fail, an expired entry is still served (with a console warning) instead of showing an error

## Testing

- **Browser-based WASM tests** (`wasm-bindgen-test`, `run_in_browser`) live alongside the code in `src/github.rs`
- Run them with `wasm-pack test --headless --firefox` (or `just test`); the `justfile` and CI `test` job use Firefox
- Also verify manually with `trunk serve`; check the console for WASM panics (in debug builds)

## Important Notes

- **CSR only** — no SSR, all rendering happens client-side
- **Browser APIs** accessed via `web-sys` and `js-sys`
- **GitHub API** has rate limits (60 req/hour unauthenticated)
- **Cache invalidation** — manual refresh or wait for 5-min TTL
- **WASM size** optimized heavily for fast page loads
- **`prefers-reduced-motion`** — CSS animations and transitions are suppressed via a global media query; `main.rs` applies a `reduced-motion` class to `<html>` so future CSS/JS can share the same signal

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

- **rust.yml** — Lint (clippy + fmt + cargo-machete), browser WASM tests, Trunk build with a 500 KB WASM size budget, deploy to Cloudflare Pages (pushes to `main`/`dev` and manual dispatches only)
- **enforce_pr_title.yml** — Validates PR titles follow conventional commits

## Adding a New Section

To add a new page section:

1. Create file in `src/components/sections/{section}.rs`
2. Define `{Section}` component with `#[component]` macro
3. Add the module declaration in `src/lib.rs` under the `sections` block
4. Add a `pub use sections::{section}::{Section};` re-export in `src/lib.rs`
5. Import in `src/app.rs` and add to `App` view

### Adding a New Component

1. Determine category (`sections`, `scenes`, or `ui`)
2. Create file in the appropriate subdirectory
3. Define component with props struct named `{Component}Properties` where applicable
4. Add the module declaration in `src/lib.rs` under the appropriate block
5. Add a re-export in `src/lib.rs`
6. Add rustdoc comments explaining purpose
7. Update `AGENTS.md` architecture tables if the component is part of the page layout

## Memory System

This project uses Claude Code's persistent memory in `.claude/memory/`. These files persist across sessions and different PCs. Review `MEMORY.md` for existing context about the user and project.
