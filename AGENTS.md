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

# Lint with pedantic lints enabled; every warning is treated as an error.
cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings
```

These also exist as `just` recipes (`just lint`, `just fmt-check`, `just deps-check`, `just test`, `just doc`, `just build`, `just serve`, `just size`, `just validate`); see `just --list`.

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
   band stack, in reading order: `Header`, `MainProjects`, `Hero`, the
   subprojects/team slot, then `Footer`.
3. **`Footer`** — in-flow centred band at the bottom of the sheet, carrying the
   copyright, the subprojects/team toggle and the site links. It is not pinned
   to the viewport.

### Component Organization

Components are grouped by function in `src/components/`:

#### Layout Bands (`src/components/layout/`)

| Component      | File              | Purpose                                                      |
| -------------- | ----------------- | ------------------------------------------------------------ |
| `Main`         | `main.rs`         | Heading and the band stack, in reading order                 |
| `Header`       | `header.rs`       | Opening band with the ASCII mark and tagline                 |
| `MainProjects` | `mainprojects.rs` | Equal-width left/right main project panels                   |
| `Hero`         | `hero.rs`         | Focal band: window mockup on a colour wash                   |
| `Subprojects`  | `subprojects.rs`  | Equal-width three-card subproject links                      |
| `Footer`       | `footer.rs`       | Closing band: copyright, band toggle, site links             |
| `Team`         | `team.rs`         | Team band with large round avatars; swaps with `Subprojects` |

#### UI Primitives (`src/components/ui/`)

| Component  | File           | Purpose                 |
| ---------- | -------------- | ----------------------- |
| `AsciiArt` | `ascii_art.rs` | XODIUM ASCII glyph mark |

#### UI Icons (`src/components/ui/icons/`)

| Component          | File                 | Purpose                |
| ------------------ | -------------------- | ---------------------- |
| `BuyMeACoffeeIcon` | `buy_me_a_coffee.rs` | Buy Me a Coffee cup    |
| `CadioThekaIcon`   | `cadiotheka.rs`      | Cadiotheka brand glyph |
| `GitHubIcon`       | `github.rs`          | GitHub Octocat         |

#### Effects (`src/components/effects/`)

| Component        | File      | Purpose                                       |
| ---------------- | --------- | --------------------------------------------- |
| `BlobBackground` | `blob.rs` | Animated SVG blob wash; caller sets placement |

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
├── components/
│   ├── layout/                # Sheet bands, stacked top to bottom
│   │   ├── main.rs
│   │   ├── header.rs
│   │   ├── mainprojects.rs
│   │   ├── hero.rs
│   │   ├── subprojects.rs
│   │   ├── footer.rs
│   │   └── team.rs
│   ├── effects/               # Decorative background effects
│   │   └── blob.rs
│   └── ui/                    # UI primitives and icons
│       ├── ascii_art.rs
│       └── icons/
│           ├── buy_me_a_coffee.rs
│           ├── cadiotheka.rs
│           └── github.rs

public/
├── style.css                  # Tailwind + DaisyUI (halloween theme)
├── favicon.svg                # Site icon
└── _headers                   # Cloudflare Pages response headers

index.html                     # Trunk entry template
Trunk.toml                     # Trunk configuration
```

### Key Conventions

- **Register modules and re-exports in `src/lib.rs` explicitly.** Do not use `mod.rs` files. The crate root declares the module tree inside inline `pub mod components { pub mod layout { .. } pub mod ui { .. } }` blocks. Use `#[path = "..."]` attributes when a module file lives in a subdirectory and cannot be reached by the conventional module path.
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
- **CSS:** Tailwind and DaisyUI utility classes first. `public/style.css` is for what utilities cannot express: page-frame rules, `@keyframes` plus their `--band-delay` timings, `::before` overrides of DaisyUI internals, and expressions that need the element's own `em` (the ASCII mark's fitted `font-size`). When a rule only sets layout, colour, spacing or a plain transition, use a utility instead.
- **Do not add `//` line comments.** Use `///` doc comments (or `//!` module docs) to explain intent; keep the code itself self-documenting. This applies to `view!` macro blocks too — meaningful intent in a template should live on the component's or helper's doc comment, not as a structural label inside the view.

### Component Patterns

**Props struct:**

```rust
#[derive(Clone)]
pub struct TeamProperties {
    pub on_close: Rc<dyn Fn() + 'static>,
}
```

**Async data with LocalResource:**

`Team` fetches its own members when it mounts, so a band that mounts later still
has data without its parent passing a prop down:

```rust
let members = LocalResource::new(|| async {
    fetch_members().await.unwrap_or_default()
});
```

That call is usually a cache hit because `Main` prefetches the same endpoint
shortly after load (see [Team Section](#team-section)).

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

### Lower Band Swap

The band below the hero is a single slot that shows either `Subprojects` or
`Team`. `Main` provides the shared state as context, following the
`SelectedProject` pattern:

```rust
let lower_band = LowerBandState::provide();
```

- `LowerBandState` wraps the shared `RwSignal` and exposes `get`, `set` and
  `toggle`. Consumers read it via `LowerBandState::use_context()`.
- The control that changes the slot is a `<button>` with `aria-pressed`, never a
  link: a link cannot change state. Label it with the band that is _not_
  currently shown, so it names the destination.
- `Main::view` picks the band with a `match`, rendering each arm through
  `.into_any()` because the branches are different view types.
- The slot's bands share a pinned height from `md` up, so swapping never resizes
  the sheet. Keep any new band mounted in that slot to the same contract.

### Header Band

`Header` draws the XODIUM ASCII mark with the tagline. It is a column on narrow
screens and a row from `sm` up, so the tagline moves under the mark rather than
beside it.

The mark is scaled by a container-relative `font-size` in `public/style.css`.
The divisor there is the glyph block's column count times 0.6 (the advance of one
monospace glyph), so the mark shrinks to the band's inline width instead of
overflowing. If the art's column count changes, the divisor must change with it.

### Load Entrance and Swap Animations

`SheetEntrance` (in `main.rs`) owns both animations, and the two are mutually
exclusive per element:

- `band_class()` returns `sheet-band-enter` while the page is loading in, which
  plays `slide-up` on the band itself.
- `swap_class()` returns `sheet-band-swap` only once a swap has been requested,
  which fades the band's **children**.
- These animate _different elements_, so they do not override each other. Do not
  collapse them into one flag: the swap class would then re-animate a band's
  children the moment the entrance ended, which reads as a flicker.
- A band that is only reachable through the swap does not take `band_class`:
  animating its bottom rule on mount would look like a redraw.
- Entering bands stagger top to bottom through per-band `--band-delay` values in
  `public/style.css`. A newly added band needs its own delay if it should arrive
  in sequence.

### Bands in General

Every band is a `<section class="sheet-band ...">` stacked inside `Main`, and
the conventions below apply to all of them:

- Separated by `border-b border-base-content/40`, the same rule colour as the
  sheet frame. The side rules come from `.blueprint-sheet::before`, so bands do
  not draw their own left and right borders.
- Row-based content sits in `const` slices at the top of the component file, so
  the order and copy are edited in one place.
- Cards and cells that read as drafted cells are separated by `divide-*` rules
  rather than by gaps, and share equal width.
- Anything that must keep two bands the same size is pinned to a shared CSS
  variable in `public/style.css` rather than expressed per band.
- Where a layout only works because a band is allowed to grow with its content
  (or is stopped from doing so), note that in the component's doc comment. These
  pairs are the easiest thing to "simplify" into a clipping bug.

### Main Projects Tabs

The main project marks are tabs that select which project the hero shows, and
the relationship holds at every breakpoint. There is deliberately no branch on
viewport width:

- Each mark is a `<button role="tab">` with a `tabpanel` beside it. Since the
  hero is on the page at every width, the tab always controls something visible
  and the unselected panel may be announced `aria-selected="false"` honestly.
- Do not reintroduce a width branch unless the hero is hidden at some width
  again. That is what justified the old split, and it went with the hero's
  breakpoint.
- Inert action buttons on these panels are anchors gated on
  `not-aria-disabled`, with the attribute bound as a **string**. A `bool`
  attribute is written presence-only, so `true` produced `aria-disabled=""` and
  the gates stopped matching.

### Hero Band

`Hero` is the focal band: a `DaisyUI` `mockup-window` filling the band's padded
box, showing the project the marks select. The window body is a mosaic of that
project's feature cards.

- Each `MainProject` owns its `cards: &'static [HeroCard]` slice, so the plate
  always describes the selection. `Hero` only reads `project_at(..)`.
- A card's `span` holds authored Tailwind utilities. Spans are hand-tuned, not
  generated, and are `md:`-only: the grid is one column below `sm` and two up at
  `sm`, where a span would leave a hole. A lone card is the exception and may
  carry an `md:col-start-*` to sit centred.
- The mosaic is `grid-flow-dense` with `auto-rows-min`, so later tiles backfill
  the gap a span leaves and the grid never forces the band taller than its share.
- Cards are inert: plain `<div>`s, no links and no focus targets, so the plate
  stays the marks' `tabpanel` without adding tab stops inside it. If a card ever
  links out, revisit whether the hero should still be a `tabpanel`.
- Card copy must stand alone. Below `sm` the tiles stack, so no card may borrow
  meaning from a neighbour.
- The band grows into the sheet's leftover height from `sm` up and sizes to its
  tiles below `sm`. Keep the two halves of that pair together: a grown band on a
  phone hands the hero a share of the sheet rather than the height its tiles need,
  and the window then clips them. Nothing in `public/style.css` pins this band's
  height, so the utilities are the only place it is set.
- Tiles are filled with `base-100`, the token the page itself is painted with,
  and never left transparent. If a tile needs its edge read, use the border, not
  a different surface colour.
- The unreleased project still supplies real cards with real copy rather than
  placeholder filler. Prefer an honest "under construction" card to hidden or
  blurred content: the plate stays readable, so nothing has to be kept from
  assistive tech.

### Team Section

`Team` is mounted in the lower band slot (see [Lower Band Swap](#lower-band-swap)),
not as a modal. It is a ruled band matching `Subprojects`: a centred row of round
avatars, each linking to a member's GitHub profile in a new tab.

- The component fetches its own members via `fetch_members` when it mounts, and
  `Main` prefetches the same endpoint shortly after load so the first open is
  usually a cache hit. Keep that pairing if either side changes.
- While the request is pending the band draws placeholder circles in the same
  avatar box, so it does not swap in empty and then reflow.
- It manages its own focus: focus on mount, close on Escape through a
  document-level listener, and restore the previously active element on cleanup.
- Avatar rings are drawn with `border-*` utilities on the `.avatar` wrapper, not
  on the inner element: `avatar-group` clips the wrapper, so an inner border is
  cut away. Our unlayered utilities beat DaisyUI's layered group border, which is
  what keeps the ring visible.

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
  page and band entry animations. No Rust code toggles a class for this.

## Claude Code Workflow

### Task Management

**When creating tasks:**

- Number tasks in the name (e.g., "1. Add new shortcut", "2. Update TeamAvatars styling")

**After completing each task:**

- Ask the user if they want to git commit the changes or adjust before committing

**When all tasks in a worktree are complete:**

- Ask the user if they want to git publish (push) the changes or adjust before publishing

### After Making Edits

**rustdoc is the primary documentation.** Intent belongs on the item it
describes: component doc comments explain why a layout is pinned, why a
breakpoint exists, and what breaks if it is removed. Update them whenever you add
public API, change a component's interface, or make a non-obvious choice.

**`AGENTS.md` is for what outlives individual edits.** Update it only when one of
these genuinely changes:

- the module tree, or which bands make up the page
- a cross-cutting convention (props naming, static data, CSS split, lint rules)
- a rule whose removal would cause a bug that a reader could not spot locally
  (a pinned height, a two-flag animation split, an authored span scheme)

Do **not** update it for: copy changes, card contents, colours, spacing, tile
spans, component-internal structure, or a fixed bug. Those belong in the code and
in the commit message. If a sentence would need editing the next time someone
tweaks a value, it is in the wrong file.

**Verification:** run `trunk build` (or `just validate`) after edits, and keep
the lint gates passing — see [Quick Commands](#quick-commands).

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **rust.yml** — Lint (clippy + fmt + rustdoc + cargo-machete), browser WASM tests, Trunk build with a 500 KB WASM size budget, deploy to Cloudflare Pages (pushes to `main`/`dev` and manual dispatches only)
- **enforce_pr_title.yml** — Validates PR titles follow conventional commits

## Adding a New Section

To add a new page section:

1. Create file in `src/components/layout/{section}.rs`
2. Define `{Section}` component with the `#[component]` macro
3. Add the `pub mod {section};` declaration inside `pub mod components { pub mod layout { .. } }` in `src/lib.rs`
4. Add a `pub use layout::{section}::{Section};` re-export next to the other
   `pub use layout::..` lines in `src/lib.rs`
5. Import it (`crate::components::layout::..` or the re-exported path) in
   `src/app.rs` and add it to the `App` view

### Adding a New Component

1. Determine category (`layout`, `ui`, or `effects`; plus `ui/icons` for icons)
2. Create file in the appropriate subdirectory
3. Define component with props struct named `{Component}Properties` where applicable
4. Add the module declaration and re-export in `src/lib.rs`
5. Add rustdoc explaining its purpose

No `AGENTS.md` edit is needed unless the component joins the page layout (then add
it to the band table and the page-layout reading order).

## Memory System

This project uses Claude Code's persistent memory in `.claude/memory/`. These files persist across sessions and different PCs. Review `MEMORY.md` for existing context about the user and project.
