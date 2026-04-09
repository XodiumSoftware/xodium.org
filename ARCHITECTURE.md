# ARCHITECTURE.md

This file provides guidance when working with code in this repository.

## Project Overview

xodium.org is the Xodium Software organization website. Built with Rust + Leptos (CSR), compiled to WebAssembly via Trunk, and deployed to GitHub Pages.

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

- **`main.rs`** — WASM entry point. Installs `console_error_panic_hook` in debug builds, then mounts the Leptos `App` component to `<body>`.
- **`lib.rs`** — Crate root. Declares `app`, `components`, and `github` modules and re-exports everything.
- **`app.rs`** — Contains the `App` component that defines the full page layout.

### Page Layout (`App`)

The single-page layout is composed as follows:

1. **Skip link** — accessibility anchor to `#main-content`
2. **`Header`** — sticky navbar with logo and navigation
3. **`#landing` section** — hero with `BlueprintGrid`, `WireframeShapes`, `LineDrawHero`, `ParallaxLanding`, gradient blobs, and `CodeBlock`
4. **Divider** — `LineDraw` animation
5. **`#projects` section** — `HexPattern`, `FadeOverlay`, and `ProjectGrid` in a sidebar layout with vertical "PROJECTS" title
6. **Divider** — `LineDraw` animation
7. **`#team` section** — `TeamDeckSection`
8. **`Footer`** — site footer

### Component Organization (`src/components/`)

Components are organized into submodules by function:

#### Sections (`src/components/sections/`)

| Component           | File               | Role                                                                         |
|---------------------|--------------------|------------------------------------------------------------------------------|
| `Header`            | `header.rs`        | Sticky navbar with logo and navigation links.                                |
| `Footer`            | `footer.rs`        | Site footer with links and copyright.                                        |
| `ProjectGrid`       | `projectgrid.rs`   | Fetches repos via `LocalResource` → `fetch_repos()`, renders `ProjectCard`s. |
| `TeamDeckSection`   | `teamdeck.rs`      | Fetches members via `LocalResource` → `fetch_members()`, renders `TeamCard`s.|

#### Cards (`src/components/cards/`)

| Component     | File             | Role                                                                                 |
|---------------|------------------|--------------------------------------------------------------------------------------|
| `ProjectCard` | `projectcard.rs` | Card for a single repo: name, description, language badge, star count, visibility.   |
| `TeamCard`    | `teamcard.rs`    | Member avatar + login with role badge, linking to GitHub profile.                    |

#### Visual Effects (`src/components/effects/`)

| Component         | File                | Role                                                               |
|-------------------|---------------------|--------------------------------------------------------------------|
| `BlueprintGrid`   | `blueprintgrid.rs`  | Animated SVG blueprint-style grid background.                      |
| `WireframeShapes`| `wireframes.rs`     | Floating wireframe geometric shapes (cube, pyramid, cylinder).     |
| `ParallaxLanding`| `parallax.rs`       | Parallax scroll effect for the landing section.                    |
| `HexPattern`     | `hexgrid.rs`        | Hexagonal grid overlay pattern.                                    |
| `FadeOverlay`    | `sectionfade.rs`    | Gradient fade overlay for section transitions.                     |

#### Animations (`src/components/animations/`)

| Component       | File              | Role                                                      |
|-----------------|-------------------|-----------------------------------------------------------|
| `LineDraw`      | `linedraw.rs`     | Animated horizontal line divider between sections.          |
| `LineDrawHero`  | `linedraw.rs`     | Hero variant of line draw animation.                      |

#### UI Primitives (`src/components/ui/`)

| Component       | File              | Role                                                                |
|-----------------|-------------------|---------------------------------------------------------------------|
| `CodeBlock`     | `codeblock.rs`    | Animated typewriter-style code display with syntax highlighting.    |
| `CornerFrame`   | `cornerframe.rs`  | Decorative corner frame wrapper for content sections.               |
| `data_grid`     | `datagrid.rs`     | Generic `Suspense` wrapper for async data with loading/error states.|

### GitHub API (`src/github.rs`)

All GitHub data fetching is centralized here.

**Public surface:**

- `fetch_members() -> Result<Vec<Member>, String>` — paginates `GET /orgs/XodiumSoftware/members`, then fetches detailed user info for each member.
- `fetch_repos() -> Result<Vec<Repo>, String>` — paginates `GET /orgs/XodiumSoftware/repos?type=public`, filters out forks, sorts by `stargazers_count` descending.

**Types:**

- `Repo` — repository data: name, description, stargazers_count, language, visibility, html_url, topics.
- `Member` — organization member: login, avatar_url, html_url, role.

**Internal helpers:**

- `fetch<T>(endpoint)` — cache-then-network. Checks `localStorage` first (key `xodium:{endpoint}`, TTL 5 min via `{key}:ts` entry). Retries up to 3 times with exponential backoff on 5xx errors.

### Props Convention

Component properties are plain `#[derive(Clone)]` structs named `{Component}Properties` (e.g., `ProjectCardProperties`, `TeamCardProperties`). They are passed as a single `props` parameter.

### Static Assets

- `public/style.css` — Tailwind CSS source with custom theme variables.
- `public/icons/` — SVG icons including `favicon.svg`, `github.svg`, `wiki.svg`, `sponsor.svg`.
- `index.html` — HTML template processed by Trunk.

### Build Pipeline

1. **Trunk** — bundles the WASM binary, runs Tailwind CSS, copies static assets from `public/` to `dist/`.
2. **Cargo release profile** — `opt-level = "z"`, `lto = true`, `codegen-units = 1`, `panic = "abort"`, `strip = true`.

### Key Conventions

- All data fetching uses `LocalResource` (not `Resource`) so async futures run on the WASM thread.
- `Suspense` is provided by the `data_grid` helper — do not inline ad-hoc suspense boundaries in grids.
- Static link/icon tables are `const` slices of plain structs defined at the top of their respective component files.
- External links always carry `target="_blank" rel="noopener noreferrer"`.
- CSS is Tailwind + DaisyUI utility classes via `style.css`.
