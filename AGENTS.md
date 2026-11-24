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

| Category          | Technology                | Purpose                         |
| ----------------- | ------------------------- | ------------------------------- |
| **Framework**     | Leptos (CSR)              | Reactive web framework          |
| **Build Tool**    | Trunk                     | WASM bundler + dev server       |
| **Styling**       | Tailwind CSS + DaisyUI    | Utility-first CSS               |
| **JS Interop**    | wasm-bindgen              | WASM glue                       |
| **Panic Handler** | console_error_panic_hook  | Debug panic messages in console |
| **Docs**          | rustdoc (via `cargo doc`) | API documentation               |

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

# Compile test targets for the WASM target (no test targets exist today)
cargo test --target wasm32-unknown-unknown --no-run

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

The single-page application is a blueprint-style drawing whose bands are
stacked in one sheet, wrapped in a `.sheet-frame` wrapper in `app.rs`. The sheet's
left and right rules are the `body` border in `public/style.css`:

1. **Skip Link** — accessibility anchor to `#main-content`
2. **Sheet** (`<main id="main-content">`) — accessible page heading and the
   band stack, in reading order: `Header`, `Hero`, `Subprojects`, then `Footer`.
3. **`Footer`** — in-flow centred band at the bottom of the sheet, carrying the
   XODIUM wordmark and the site links. It is not pinned to the viewport.

### Component Organization

Components are grouped by function in `src/components/`:

#### Layout Bands (`src/components/layout/`)

| Component     | File             | Purpose                                                |
| ------------- | ---------------- | ------------------------------------------------------ |
| `Header`      | `header.rs`      | Opening band with the ASCII mark and tagline           |
| `Hero`        | `hero.rs`        | Focal band: both main projects, split corner to corner |
| `Subprojects` | `subprojects.rs` | Equal-width three-card subproject links                |
| `Footer`      | `footer.rs`      | Closing band: wordmark and site links                  |

#### UI Primitives (`src/components/ui/`)

| Component   | File           | Purpose                      |
| ----------- | -------------- | ---------------------------- |
| `AsciiArt`  | `ascii_art.rs` | XODIUM ASCII glyph mark      |
| `Spotlight` | `spotlight.rs` | Glow that follows the cursor |

#### UI Icons (`src/components/ui/icons/`)

These render inline SVG; the outline set inherits `currentColor` and the
caller's size utility.

| Component          | File                 | Purpose                                     |
| ------------------ | -------------------- | ------------------------------------------- |
| `ArrowRightIcon`   | `arrow_right.rs`     | Right arrow for the call-to-action card     |
| `BranchIcon`       | `branch.rs`          | "Open source" feature glyph                 |
| `BuyMeACoffeeIcon` | `buy_me_a_coffee.rs` | Buy Me a Coffee cup                         |
| `CreatorsIcon`     | `creators.rs`        | "Built for creators" feature glyph          |
| `GhostIcon`        | `ghost.rs`           | Ghost for the blurred placeholder cards     |
| `GitHubIcon`       | `github.rs`          | GitHub Octocat                              |
| `HistoryIcon`      | `history.rs`         | "Versioned parts" feature glyph             |
| `HubIcon`          | `hub.rs`             | "One hub" feature glyph                     |
| `InspectIcon`      | `inspect.rs`         | "Inspect before you download" feature glyph |
| `SpeedIcon`        | `speed.rs`           | "Fast by design" feature glyph              |

### Project Structure

```
src/
├── main.rs                    # WASM entry point
├── lib.rs                     # Crate root, module declarations and re-exports
├── app.rs                     # Root App component
├── components/
│   ├── layout/                # Sheet bands, stacked top to bottom
│   │   ├── header.rs
│   │   ├── hero.rs
│   │   ├── subprojects.rs
│   │   └── footer.rs
│   └── ui/                    # UI primitives and icons
│       ├── ascii_art.rs
│       ├── spotlight.rs
│       └── icons/             # One inline SVG component per file
│           ├── arrow_right.rs
│           ├── branch.rs
│           ├── buy_me_a_coffee.rs
│           ├── creators.rs
│           ├── ghost.rs
│           ├── github.rs
│           ├── history.rs
│           ├── hub.rs
│           ├── inspect.rs
│           └── speed.rs

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
  `Closure<dyn FnMut(..)>` handles. If a listener ever needs removing again, call
  `.into_js_value()` and keep the resulting `js_sys::Function` — that type is
  `Send + Sync`. No component registers an event listener today.
- **Props:** `#[derive(Clone)]` structs named `{Component}Properties`. A component
  that needs no configuration takes no props at all rather than an empty struct.
- **Async data:** Use `LocalResource` (not `Resource`) for WASM thread execution.
  No component fetches anything today; keep this rule for the next one that does.
- **External links:** Always use `target="_blank" rel="noopener noreferrer"`
- **Static data:** Define `const` slices at top of component files
- **CSS:** Tailwind and DaisyUI utility classes first. `public/style.css` is for what utilities cannot express: page-frame rules, `@keyframes` plus their `--band-delay` timings, `::before` overrides of DaisyUI internals, and expressions that need the element's own `em` (the ASCII mark's fitted `font-size`). When a rule only sets layout, colour, spacing or a plain transition, use a utility instead.
- **Do not add `//` line comments.** Use `///` doc comments (or `//!` module
  docs) instead, and keep the code itself self-documenting. This applies to
  `view!` blocks too.
- **Docs stay generic and quiet.** One short line per item — a module, component,
  constant or field says what it _is_, not how it works. Do not narrate class
  names, CSS rules, pixel maths, breakpoint choices or the history of a fix; a
  doc should never need editing because a layout value moved. That applies to
  rustdoc in `src/` and to prose here alike.

### Component Patterns

**Props struct:**

```rust
#[derive(Clone, Copy)]
pub struct {Component}Properties {
    pub class: &'static str,
}
```

**Static data:**

Row content is a `const` slice at the top of the component file, so no component
in the app has an async data path today.

- Props structs on a private component may stay private; `missing_docs` and
  `unreachable_pub` still apply to everything public.

### Build Pipeline

1. **Trunk** bundles WASM, processes Tailwind CSS, copies the `public/` assets declared via `data-trunk` links in `index.html` → `dist/`
    - `build.create_nonce` in `Trunk.toml` must stay on: Trunk injects its loader as an inline `<script type="module">`, which no hash can cover, and `public/_headers` only permits it by nonce. Turning it off blanks the page.
    - The placeholder in `_headers` has to be Trunk's own (`{{__TRUNK NONCE__}}`, see `nonce_placeholder` in `Trunk.toml`). It is written verbatim into the emitted HTML and `<link>` elements, so a different token there leaves the CSP allowing a nonce no element carries. Nothing substitutes it in the response: Cloudflare Pages only expands its own `{placeholder}` syntax in `_headers`, not in the HTML body.
    - `Trunk.toml` pins the `tailwindcss` tool version. This is the version of Trunk’s bundled Tailwind distribution (`dobicinaitis/tailwind-cli-extra`), not the upstream Tailwind CSS version. The bundle includes the latest Tailwind CSS + DaisyUI; the actual Tailwind CSS version resolved at build time is shown in the build log (e.g. `tailwindcss v4.2.2`).
    - Renovate manages this version via a custom regex manager in `.github/renovate.json`; the TOML line is annotated with `# renovate: datasource=github-releases depName=dobicinaitis/tailwind-cli-extra`.
2. **Cargo release profile** optimizations:
    - `opt-level = "z"` (size)
    - `lto = true` (link-time optimization)
    - `codegen-units = 1` (single codegen unit)
    - `panic = "abort"` (no unwinding)
    - `strip = true` (remove symbols)

### Header Band

`Header` draws the XODIUM ASCII mark with the tagline. It is a column on narrow
screens and a row from `sm` up, so the tagline moves under the mark rather than
beside it.

The mark is scaled by a container-relative `font-size` on the `<pre>` in
`ascii_art.rs`. The divisor there is the glyph block's column count times 0.6
(the advance of one monospace glyph), so the mark shrinks to the band's inline
width instead of overflowing. If the art's column count changes, the divisor must
change with it.

### Animation

The hero's tiles carry the site's only entrance animation: `tile-enter` (in
`public/style.css`) plays `slide-up` per tile, staggered by the inline
`--tile-delay` that `tile_enter` in `hero.rs` assigns. Every other band and
control switches state instantly, so do not add transitions or `animate-*`
utilities elsewhere.

Hovered controls are lit by a spotlight: `SPOTLIGHT_SURFACE` on the control and a
`<Spotlight />` child put the glow above the control's own fill, and
`public/spotlight.js` (loaded through `index.html`) feeds it the pointer position.
The class, the component and the script are coupled — renaming the class leaves
the glow parked at its default corner.

### Bands in General

Every band is a block-level element stacked inside the sheet in `app.rs`, and
the conventions below apply to all of them:

- Unruled: no band draws a border between itself and the next, and `Hero` draws
  none at all. What separates neighbouring bands is their own fill, so a band
  that needs a visible edge must supply one.
- Row-based content sits in `const` slices at the top of the component file, so
  the order and copy are edited in one place.
- Cards and cells that read as drafted cells are separated by `divide-*` rules
  rather than by gaps, and share equal width.
- Where a layout only works because a band is allowed to grow with its content
  (or is stopped from doing so), note that in the component's doc comment. These
  pairs are the easiest thing to "simplify" into a clipping bug. `Subprojects`
  is the current example: it is pinned to a fixed height and clipped so the
  cards cannot stretch it.

### Hero Band

`Hero` is the focal band and carries both main projects at once: Cadiotheka in
the upper-left half, the unannounced project in the lower-right half. Nothing
selects between them any more.

- The two halves are ruled cells, separated by a rule running bottom-left to
  top-right from `md` up. The rule is a rotated square in the band's background
  layer, not an `<svg>` line and not a gradient: a gradient's angle is fixed
  while the corner-to-corner line's angle follows the box shape, and an `<svg>`
  line in a `none`-scaled view box would squash its stroke. Keep it a rotated
  square.
- The band is `relative isolate` and the rule sits in its `-z-1` layer, so it is
  resolved against the band rather than the page.
- Below `md` the halves stack, and the halves' paint is what divides them.
- The band grows into the sheet's leftover height and keeps a `min-h-*` floor.
  Keep that pair together: the halves are `overflow-hidden` (that is what clips the
  rule) and the floor is what stops the taller half's tiles being cut off.
- `ProjectHalf` owns the shared structure — heading row, description, tiles,
  actions — so the two halves cannot drift. A new half is a call site, not a new
  component.
- Tiles are filled with `base-100`, the token the page itself is painted with,
  and never left transparent. If a tile needs its edge read, use the border, not
  a different surface colour.
- Tiles are inert: plain `<div>`s, no links and no focus targets. Only the half's
  action row carries links.
- The unreleased project still supplies real copy rather than placeholder
  filler. Prefer an honest "under construction" card to hidden or blurred
  content: the half stays readable, so nothing has to be kept from assistive
  tech.
- The band is static: both halves are always shown and nothing selects between
  them.

## Testing

- Browser WASM tests (`wasm-bindgen-test`, `run_in_browser`) ran against the
  GitHub client that used to live in `src/github.rs`; they went with it. Add
  them back alongside any future client.
- No test targets exist. `just test` compiles them with
  `cargo test --target wasm32-unknown-unknown --no-run`; `--no-run` matters
  because a wasm binary cannot be executed natively (it fails with
  "not a valid Win32 application" on Windows). The lint/build gates carry the
  verification. Do not gate CI on a test job that has nothing to run:
  `wasm-pack test` fails outright without a `wasm-bindgen-test` dev-dependency.
  Add the dev-dependency, the tests and the job together when they come back.
- Also verify manually with `trunk serve`; check the console for WASM panics
  (in debug builds)

## Important Notes

- **CSR only** — no SSR, all rendering happens client-side
- **Browser APIs** — no component touches the DOM directly; focus is handled by
  `autofocus` in the markup and the pointer by `public/spotlight.js`, so there
  is no `web-sys` dependency
- **WASM size** optimized heavily for fast page loads
- **`prefers-reduced-motion`** — handled entirely in `public/style.css` via
  the `@media (prefers-reduced-motion: reduce)` block, which zeroes out the
  hero tile animation. No Rust code toggles a class for this.

## Claude Code Workflow

### Task Management

**When creating tasks:**

- Number tasks in the name (e.g., "1. Add new shortcut", "2. Update Hero tile styling")

**After completing each task:**

- Ask the user if they want to git commit the changes or adjust before committing

**When all tasks in a worktree are complete:**

- Ask the user if they want to git publish (push) the changes or adjust before publishing

### After Making Edits

**rustdoc stays generic.** Every public item carries a doc comment, kept to one
short line: what the item is, not how it works. Do not add notes about utility
strings, CSS rules, sizing maths, breakpoint choices, or the reasoning behind a
past change — that belongs in the commit message or nowhere. Never expand a doc
comment to justify an edit.

**`AGENTS.md` is for what outlives individual edits.** Update it only when one of
these genuinely changes:

- the module tree, or which bands make up the page
- a cross-cutting convention (props naming, static data, CSS split, lint rules)
- a rule whose removal would cause a bug that a reader could not spot locally
  (a pinned height, a two-flag animation split, an authored span scheme)

Do **not** update it for: copy changes, card contents, colours, spacing, tile
spans, component-internal structure, or a fixed bug. Those belong in the commit
message. If a sentence would need editing the next time someone tweaks a value,
it is in the wrong file.

**Do not add documentation noise.** An edit to code is not a reason to add or
expand doc comments. Only touch a doc comment when the item it describes now does
something else than it says — and then shorten it to match, rather than
explaining the change.

**Verification:** run `trunk build` (or `just validate`) after edits, and keep
the lint gates passing — see [Quick Commands](#quick-commands).

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **general.yml** — Lint (clippy + fmt + rustdoc + cargo-machete), Trunk build with a 500 KB WASM size budget, deploy to Cloudflare Pages (pushes to `main`/`dev` and manual dispatches only)
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
