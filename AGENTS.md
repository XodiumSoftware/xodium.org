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
| `HeroDemo` | `hero_demo.rs` | Live cross-origin demo frame for the hero window |

#### UI Icons (`src/components/ui/icons/`)

| Component          | File                 | Purpose             |
| ------------------ | -------------------- | ------------------- |
| `BuyMeACoffeeIcon` | `buy_me_a_coffee.rs` | Buy Me a Coffee cup |
| `CadioThekaIcon`   | `cadiotheka.rs`      | Cadiotheka brand glyph |
| `GitHubIcon`       | `github.rs`          | GitHub Octocat      |

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
│       ├── hero_demo.rs
│       └── icons/
│           ├── buy_me_a_coffee.rs
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

- `LowerBand` is the enum of bands (`Subprojects` is the default).
- `LowerBandState` wraps the `RwSignal` and exposes `get`, `set` and `toggle`.
  `Footer` reads it via `LowerBandState::use_context()` and renders a button
  that toggles the slot.
- The footer entry is a `<button>`, not a link: a link cannot change state,
  and `aria-pressed` is what communicates the toggle to assistive tech. It
  labels the band that is _not_ currently shown, so it reads `TEAM` on the
  default view and `SUBPROJECTS` once the team is open.
- `Main::view` picks the band with `match lower_band.get()`, rendering each arm
  through `.into_any()` because the two branches are different view types.
- `Team` keeps the `id="team"` anchor so `#team` still resolves, and pressing
  Escape calls `on_close`, which switches the slot back to `Subprojects`.

### Header Band

`Header` draws the XODIUM ASCII mark with the `> Because we can.` tagline. The
band is a column on phones and a row from `sm` up, so the tagline moves under
the mark rather than beside it on narrow screens.

- The mark is 72 monospace columns wide. `.ascii-art` in `public/style.css`
sets `font-size: min(var(--ascii-font-size), 100cqi / 43.2)`, where 43.2em is
the block's width at one glyph per 0.6em. The whole mark therefore scales down
to the band's inline width instead of overflowing the sheet, and stops at the
original `0.585rem` cap on wider screens. Change one without the other and the
mark either overflows or shrinks needlessly: the divisor is the glyph block's
column count times 0.6.

### Load Entrance and Swap Animations

`SheetEntrance` (in `main.rs`) owns both animations, and the two are mutually
exclusive per element:

- `band_class()` returns `sheet-band-enter` while the page is loading in, which
  plays `slide-up` on the band itself. `Header`, `MainProjects`, `Hero`,
  `Subprojects` and `Footer` use it. The footer is last in reading order, so it
  carries its own `--band-delay` in `public/style.css` (900ms) and enters after
  the bands above it.
- `swap_class()` returns `sheet-band-swap` only once a swap has been requested
  (see `mark_swapped`), which fades the band's **children**. `Subprojects` and
  `Team` use it.
- These animate _different elements_, so they do not override each other. A
  single flag would therefore have re-animated the subprojects cards the moment
  the load entrance ended, which read as a flicker. Keep the two flags separate.
- `band_class` is never applied to `Team`: it is only reachable through the
  swap, so animating its bottom rule would look like a redraw.
- `LowerBandState::set` arms the swap, so any caller that changes the band gets
  the crossfade without extra bookkeeping.

### Subprojects Band

`Subprojects` renders three cards that share equal width and are separated by
rules, so the row reads as three drafted cells rather than flowing text.

- From `md` up the cards sit in one row, numbered left to right, divided by
  `md:divide-x` and pinned to `--lower-band-height` so swapping it for `Team`
  never resizes the sheet.
- Below `md` they stack in the same reading order. The mobile block in
  `public/style.css` releases the band's height (`height: auto`, `overflow:
  visible`) and turns the dividers horizontal. The release is load-bearing: a
  pinned height clips the stacked cards, and one whose description wraps can
  need more room than the desktop band holds. Do not reintroduce a fixed
  mobile height without checking every description at the narrowest width.
- The trade for that release is that the sheet is content-sized on phones, so
  `Team` swapping into the slot changes the document height there. That does
  not apply from `md` up, where both bands share the pinned height.

### Hero Band

`Hero` is the focal band: a `DaisyUI` `mockup-window` filling the band's padded
box, showing whichever project the main projects marks select.

The window body is a live frame of the selected project's site, so the hero
shows the running app instead of restating the title and description already
shown one band above.

- `MainProject::demo` holds an `Option<LiveFrame>` (`src`, `title`).
  `MainProjects` therefore owns both what a panel says and what the hero frames;
  `Hero` only reads `project_at(..)` and passes the frame down.
- A project with `demo: None` (the unreleased one) renders `HeroPlaceholder`,
  which keeps the window's box and centres the project name, so switching marks
  never collapses the band.
- `HeroDemo` (`components/ui/hero_demo.rs`) does the framing. It has no
  `aria-live`, since it only ever holds static chrome plus one iframe.
- The frame is scaled to `FRAME_SCALE` (50%) and pinned to the top-left with
  `origin-top-left`, over a doubled `w-[calc(100%*2)] h-[calc(100%*2)]` box that
  the wrapper crops. The framed app therefore lays out at its natural desktop
  width and overflows out of view instead of reflowing into a narrow column.
  Do not express that size through Tailwind's spacing scale: those utilities
  resolve to `calc(var(--spacing) * n)`, which is invalid inside the `scale`
  longhand, so the multiplier is written out literally.
- The iframe is `opacity-0` until its `load` event, then fades in; without that
  the window flashed the framed site's background before its content painted.
- The frame is sandboxed with `allow-scripts allow-same-origin allow-forms`
  (Trunk's WASM boot, its API calls, and its forms all break without them).
  Never add `allow-top-navigation`.
- Do not set the iframe's `allow` attribute. `clipboard-write` was tried and
  removed: the Permissions Policy parser rejects it as an unsupported feature
  name and logs a console warning on every load.
- Sign-in from inside the frame leaves the demo. Cadiotheka builds its OAuth
  URLs against its own absolute origin when it detects it is framed, so the
  visitor ends up signing in on cadiotheka.com rather than in the hero. That is
  deliberate: the provider page and the callback's redirect neither one can run
  inside a frame.
- **Two headers gate this, and both must change together.** Cadiotheka serves
  `frame-ancestors 'self' https://xodium.org https://www.xodium.org` from
  `frontend/_headers`, and this site allows the framed origin with
  `frame-src https://cadiotheka.com` in `public/_headers`. A miss on either
  side renders a blank window with a console error. The observed failure is
  `X-Frame-Options: SAMEORIGIN` in the frame's own error page, so check what
  Cadiotheka actually serves with `curl -sI https://cadiotheka.com/` rather than
  trusting the file: an older deploy can still be live.
- Do **not** add `X-Frame-Options` to Cadiotheka's `_headers`. Only
  `SAMEORIGIN` and `DENY` are valid Chrome-era values; the obsolete
  `ALLOW-FROM` is ignored, and a value without a valid ancestor list blocks the
  frame outright. `frame-ancestors` alone is what allows the embed.
- Local work needs the same pair: run Cadiotheka's `trunk serve` behind a proxy
  that rewrites the header, or temporarily relax it — `wasm-bindgen`'s own dev
  server cannot be framed from another origin as-is.

- The window uses the **background** variant (`bg-base-100`), so it stays opaque
  and the colour wash behind it reads only in the padding ring around it.
- Its border is `border-base-content/40`, the same rule colour as the band
  borders. It is `rounded-lg` rather than `rounded-box` because the theme sets
  `--radius-box: 0rem`, which would make the latter a no-op.
- The window's three traffic lights come from one `::before` stamped with a
  `box-shadow`; `public/style.css` recolours them through the shadow stops and
  forces `opacity: 1`, since DaisyUI fades them to 30%.
- The colour wash is `BlobBackground` (`components/effects/blob.rs`): one `<svg>`
  of `<circle>`s sharing a single `feTurbulence` + `feDisplacementMap` filter,
  so the roughening costs one turbulence evaluation rather than one per blob.
  Its placement comes from the caller's `class`, so it is not tied to the hero.
  The band sets `isolation: isolate` so `z-index: -1` keeps the wash inside the
  band rather than dropping it behind the sheet.

### Team Section

`Team` is mounted in the lower band slot (see [Lower Band Swap](#lower-band-swap)),
not as a modal. It is a ruled band matching `Subprojects`: a centred row of round
avatars, each linking to a member's GitHub profile in a new tab.

- The component fetches its own members via `fetch_members` when it mounts.
- `Main` also prefetches the same endpoint 1.5 s after load, so the first open is
  usually a cache hit rather than a live request. Without it the first open paid
  the full GitHub round trip before any avatar could render.
- While the request is pending the band draws `VISIBLE_AVATARS` placeholder
  circles in the same avatar box, so it does not swap in empty and then reflow.
- The band never takes the load-in entrance: it can only be reached through the
  swap, and its crossfade is gated by `SheetEntrance` (see the swap docs in
  `main.rs`).
- It manages its own focus: it focuses the band on mount, closes on Escape via
  a document-level listener (so focus position does not matter), and restores
  focus to the previously active element on cleanup.
- `.team-band-avatar` in `public/style.css` now only sets the avatar box size and
  its 2px ring; the circle, image clipping and cover fitting come from
  DaisyUI's `avatar`, and the counter type and skeleton ring are utilities in
  `team.rs`.

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
4. Add the module declaration in `src/lib.rs` under the appropriate block
5. Add a re-export in `src/lib.rs`
6. Add rustdoc comments explaining purpose
7. Update `AGENTS.md` architecture tables if the component is part of the page layout

## Memory System

This project uses Claude Code's persistent memory in `.claude/memory/`. These files persist across sessions and different PCs. Review `MEMORY.md` for existing context about the user and project.
