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

# Lint with pedantic lints enabled; every warning is treated as an error.
cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings
```

## Architecture Overview

### Entry Points

| File      | Purpose                                          |
|-----------|--------------------------------------------------|
| `main.rs` | WASM entry point, mounts `App` to `&lt;body&gt;` |
| `lib.rs`  | Crate root; declares every module and re-export |
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
| `TeamDeckSection` | `team_deck.rs`    | Fetches org members, renders `TeamCard`s     |
| `Footer`          | `footer.rs`       | Site footer                                  |

#### Cards (`src/cards/`)

| Component     | File             | Purpose                                           |
|---------------|------------------|---------------------------------------------------|
| `ProjectCard` | `project.rs`     | Repo card with name, description, stars, language |
| `TeamCard`    | `team.rs`        | Member avatar, login, role badge                  |

#### Visual Effects (`src/ui/effects/`)

| Component         | File                  | Purpose                     |
|-------------------|-----------------------|-----------------------------|
| `BlueprintGrid`   | `blueprint_grid.rs`   | Animated SVG blueprint grid |
| `WireframeShapes` | `wire_frames.rs`      | Floating 3D wireframes      |
| `ParallaxLanding` | `parallax.rs`         | Parallax scroll effect      |
| `HexPattern`      | `hex_grid.rs`         | Hexagonal grid overlay      |
| `FadeOverlay`     | `section_fade.rs`     | Gradient fade transitions   |

#### Animations (`src/animations/`)

| Component      | File          | Purpose                   |
|----------------|---------------|---------------------------|
| `LineDraw`     | `line_draw.rs` | Section divider animation |
| `LineDrawHero` | `line_draw.rs` | Hero variant              |

#### UI Primitives (`src/ui/`)

| Component     | File             | Purpose                           |
|---------------|------------------|-----------------------------------|
| `CodeBlock`   | `code_block.rs`  | Animated typewriter code display  |
| `CornerFrame` | `corner_frame.rs`| Decorative corner frame           |
| `data_grid`   | `data_grid.rs`   | `Suspense` wrapper for async data |

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
├── utils.rs                   # Shared utilities
├── sections/                  # Page sections
│   ├── header.rs
│   ├── landing.rs
│   ├── projects.rs
│   ├── team_deck.rs
│   └── footer.rs
├── cards/                     # Card components
│   ├── project.rs
│   └── team.rs
├── animations/                # Animation components
│   └── line_draw.rs
└── ui/                        # UI primitives, effects, utilities
    ├── code_block.rs
    ├── corner_frame.rs
    ├── data_grid.rs
    └── effects/               # Visual effects
        ├── blueprint_grid.rs
        ├── hex_grid.rs
        ├── parallax.rs
        ├── section_fade.rs
        └── wire_frames.rs

public/
├── style.css                  # Tailwind + custom theme
└── icons/                     # SVG icons

index.html                     # Trunk entry template
Trunk.toml                     # Trunk configuration
build.rs                       # Build script
```

### Key Conventions

- **Register modules and re-exports in `src/lib.rs` explicitly.** Do not use `mod.rs` files, and do not nest `mod` declarations inside other module files. Every module in the crate must be declared directly in the crate root (`src/lib.rs`). Use `#[path = "..."]` attributes when a module file lives in a subdirectory.
- All Clippy warnings enabled; run with `-W clippy::pedantic -D warnings` to catch pedantic lints as errors.
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
    pub title: String,
    pub description: String,
    pub link: Option<String>,
    pub language: Option<String>,
    pub stargazers_count: u32,
    pub has_pages: bool,
    pub topics: Vec<String>,
}
```

**Props with `From` conversion:**

```rust
impl From<Repo> for ProjectCardProperties {
    fn from(repo: Repo) -> Self {
        let description = repo
            .description
            .filter(|d| !d.trim().is_empty())
            .unwrap_or_else(|| "(No description)".to_string());
        Self {
            title: repo.name,
            description,
            link: Some(repo.html_url),
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            has_pages: repo.has_pages,
            topics: repo.topics,
        }
    }
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
        resource,
        move || "No projects found.",
        |projects: Vec<Repo>| {
            view! {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects
                        .into_iter()
                        .map(|project| view! { <ProjectCard props=project.into() /> })
                        .collect_view()}
                </div>
            }
        },
        Some(retry),
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

1. **rustdoc comments** — Add/update if you:
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

1. Create file in `src/sections/{section}.rs`
2. Define `{Section}` component with `#[component]` macro
3. Add the module declaration in `src/lib.rs` under the `sections` block with `#[path = "../sections/{section}.rs"]`
4. Add a `pub use sections::{section}::{Section};` re-export in `src/lib.rs`
5. Import in `src/app.rs` and add to `App` view
6. Add `LineDraw` divider before/after if needed

### Adding a New Component

1. Determine category (cards, effects, animations, ui)
2. Create file in appropriate subdirectory
3. Define component with props struct named `{Component}Properties`
4. Add the module declaration in `src/lib.rs` under the appropriate block with `#[path = "..."]`
5. Add a re-export in `src/lib.rs`
6. Add rustdoc comments explaining purpose

## Memory System

This project uses Claude Code's persistent memory in `.claude/memory/`. These files persist across sessions and different PCs. Review `MEMORY.md` for existing context about the user and project.
