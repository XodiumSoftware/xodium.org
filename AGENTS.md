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
|-------------------|-------------------------------|---------------------------------|
| **Framework**     | Leptos 0.8.17 (CSR)           | Reactive web framework          |
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
```

## Architecture Overview

### Entry Points

| File      | Purpose                                          |
|-----------|--------------------------------------------------|
| `main.rs` | WASM entry point, mounts `App` to `&lt;body&gt;` |
| `lib.rs`  | Crate root, declares modules, re-exports         |
| `app.rs`  | Root `App` component with full page layout       |

### Page Layout (`App` component)

The single-page application follows this structure:

1. **Skip Link** — accessibility anchor to `#main-content`
2. **`Header`** — sticky navbar with logo and navigation
3. **`#landing`** — hero section with `LandingSection`
4. **Divider** — `LineDraw` animation
5. **`#projects`** — sidebar layout with `ProjectsSection`
6. **Divider** — `LineDraw` animation
7. **`#team`** — `TeamDeckSection`
8. **`Footer`** — site footer

### Component Organization

Components are grouped by function in `src/components/`:

#### Sections (`src/components/sections/`)

| Component         | File             | Purpose                                      |
|-------------------|------------------|----------------------------------------------|
| `Header`          | `header.rs`      | Sticky navbar                                |
| `LandingSection`  | `landing.rs`     | Hero section with visual effects and code block |
| `ProjectsSection` | `projects.rs`    | Fetches GitHub repos, renders `ProjectCard`s |
| `TeamDeckSection` | `teamdeck.rs`    | Fetches org members, renders `TeamCard`s     |
| `Footer`          | `footer.rs`      | Site footer                                  |

#### Cards (`src/components/cards/`)

| Component     | File             | Purpose                                           |
|---------------|------------------|---------------------------------------------------|
| `ProjectCard` | `projectcard.rs` | Repo card with name, description, stars, language |
| `TeamCard`    | `teamcard.rs`    | Member avatar, login, role badge                  |

#### Visual Effects (`src/components/effects/`)

| Component         | File               | Purpose                     |
|-------------------|--------------------|-----------------------------|
| `BlueprintGrid`   | `blueprintgrid.rs` | Animated SVG blueprint grid |
| `WireframeShapes` | `wireframes.rs`    | Floating 3D wireframes      |
| `ParallaxLanding` | `parallax.rs`      | Parallax scroll effect      |
| `HexPattern`      | `hexgrid.rs`       | Hexagonal grid overlay      |
| `FadeOverlay`     | `sectionfade.rs`   | Gradient fade transitions   |

#### Animations (`src/components/animations/`)

| Component      | File          | Purpose                   |
|----------------|---------------|---------------------------|
| `LineDraw`     | `linedraw.rs` | Section divider animation |
| `LineDrawHero` | `linedraw.rs` | Hero variant              |

#### UI Primitives (`src/components/ui/`)

| Component     | File             | Purpose                           |
|---------------|------------------|-----------------------------------|
| `CodeBlock`   | `codeblock.rs`   | Animated typewriter code display  |
| `CornerFrame` | `cornerframe.rs` | Decorative corner frame           |
| `data_grid`   | `datagrid.rs`    | `Suspense` wrapper for async data |

### GitHub API (`src/github.rs`)

Centralized data fetching with `localStorage` caching:

| Function          | Endpoint                                 | Cache TTL |
|-------------------|------------------------------------------|-----------|
| `fetch_members()` | `/orgs/XodiumSoftware/members`           | 5 minutes |
| `fetch_repos()`   | `/orgs/XodiumSoftware/repos?type=public` | 5 minutes |

**Internal helpers:**

- `fetch&lt;T&gt;(endpoint)` — cache-then-network with retry logic (3 attempts, exponential backoff)
- `LocalResource` used for async (runs on WASM thread)
- `xodium:{endpoint}` cache key format

### Project Structure

```
src/
├── main.rs                    # WASM entry point
├── lib.rs                     # Crate root, module declarations
├── app.rs                     # Root App component
├── github.rs                  # GitHub API client
└── components/
    ├── mod.rs                 # Component module exports
    ├── sections/              # Page sections
    │   ├── header.rs
    │   ├── landing.rs
    │   ├── projects.rs
    │   ├── teamdeck.rs
    │   └── footer.rs
    ├── cards/                 # Card components
    │   ├── projectcard.rs
    │   └── teamcard.rs
    ├── effects/               # Visual effects
    │   ├── blueprintgrid.rs
    │   ├── wireframes.rs
    │   ├── parallax.rs
    │   ├── hexgrid.rs
    │   └── sectionfade.rs
    ├── animations/            # Animation components
    │   └── linedraw.rs
    └── ui/                    # UI primitives
        ├── codeblock.rs
        ├── cornerframe.rs
        └── datagrid.rs

public/
├── style.css                  # Tailwind + custom theme
└── icons/                     # SVG icons

index.html                     # Trunk entry template
Trunk.toml                     # Trunk configuration
build.rs                       # Build script
```

### Key Conventions

- All Clippy warnings enabled
- `unsafe_code` not needed (WASM sandbox)
- **Props:** `#[derive(Clone)]` structs named `{Component}Properties`
- **Async data:** Use `LocalResource` (not `Resource`) for WASM thread execution
- **Suspense:** Use `data_grid` helper, don't inline ad-hoc boundaries
- **External links:** Always use `target="_blank" rel="noopener noreferrer"`
- **Static data:** Define `const` slices at top of component files
- **CSS:** Tailwind utility classes via `style.css`

### Component Patterns

**Props struct:**

```rust
#[derive(Clone)]
pub struct ProjectCardProperties {
    pub repo: Repo,
}
```

**Async data with LocalResource:**

```rust
let repos = LocalResource::new( move | | async move {
fetch_repos().await.unwrap_or_default()
});
```

**Suspense wrapper:**

```rust
view! {
    {data_grid(
        repos,
        |repos| view! { <ProjectsSection /> },
        "Loading projects...",
        "Failed to load projects"
    )}
}
```

### Build Pipeline

1. **Trunk** bundles WASM, processes Tailwind CSS, copies `public/` → `dist/`
2. **Cargo release profile** optimizations:
    - `opt-level = "z"` (size)
    - `lto = true` (link-time optimization)
    - `codegen-units = 1` (single codegen unit)
    - `panic = "abort"` (no unwinding)
    - `strip = true` (remove symbols)

### Caching Strategy

GitHub API responses cached in `localStorage`:

- Key: `xodium:{endpoint}`
- Timestamp: `{key}:ts`
- TTL: 5 minutes
- Fallback to stale data on fetch failure

## Testing

- No automated tests in this project
- Test by running `trunk serve` and manually verifying in browser
- Check console for WASM panics (in debug builds)

## Important Notes

- **CSR only** — no SSR, all rendering happens client-side
- **Browser APIs** accessed via `web-sys` and `js-sys`
- **GitHub API** has rate limits (60 req/hour unauthenticated)
- **Cache invalidation** — manual refresh or wait for 5-min TTL
- **WASM size** optimized heavily for fast page loads

## Claude Code Workflow

### Task Management

**When creating tasks:**

- Number tasks in the name (e.g., "1. Add new section", "2. Update TeamCard styling")

**After completing each task:**

- Ask the user if they want to git commit the changes or adjust before committing

**When all tasks in a worktree are complete:**

- Ask the user if they want to git publish (push) the changes or adjust before publishing

### After Making Edits

**Always update documentation when code changes:**

1. **ARCHITECTURE.md** — Update if you:
    - Add/remove components or sections
    - Change the page layout
    - Modify GitHub API integration
    - Update styling approach

2. **rustdoc comments** — Add/update if you:
    - Add new public APIs
    - Change component interfaces
    - Add complex logic
    - **Run `trunk build`** to verify compilation

**Rule of thumb:** If a code change would confuse someone reading the docs, update the docs.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **build.yml** — Builds WASM with Trunk, uploads to Cloudflare Pages
- **enforce_pr_title.yml** — Validates PR titles follow conventional commits

## Adding a New Section

To add a new page section:

1. Create file in `src/components/sections/{section}.rs`
2. Define `{Section}` component with `#[component]` macro
3. Add `pub mod {section}` and `pub use sections::{section}::{Section}` in `src/components.rs`
4. Import in `src/app.rs` and add to `App` view
5. Add `LineDraw` divider before/after if needed
6. Update `ARCHITECTURE.md` section table

### Adding a New Component

1. Determine category (cards, effects, animations, ui)
2. Create file in appropriate subdirectory
3. Define component with props struct named `{Component}Properties`
4. Export from submodule's `mod.rs`
5. Re-export from `src/components/mod.rs`
6. Add rustdoc comments explaining purpose

## Memory System

This project uses Claude Code's persistent memory in `.claude/memory/`. These files persist across sessions and different PCs. Review `MEMORY.md` for existing context about the user and project.
