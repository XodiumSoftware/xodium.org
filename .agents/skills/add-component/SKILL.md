---
name: add-component
description: Scaffold a new component or page section for the xodium.org Leptos CSR site, including file placement, prop conventions, exports, and verification.
---

# Add a New Component

Use this skill when the user wants to add a new component or page region to the xodium.org Leptos app.

## File placement

All modules are declared in `src/lib.rs` — there are no `mod.rs` files anywhere. Components live in one of three buckets:

- **Standalone UI primitive** (a reusable widget) — `src/components/ui/{name}.rs`
- **Scene element** (something rendered inside the 3D viewport) — `src/components/scenes/{name}.rs`
- **Page-level section** (a full region of the single-page layout) — `src/components/sections/{name}.rs`

File names are lowercase with snake_case (e.g. `feature_card.rs`, `iso_viewport.rs`). Component names are PascalCase matching the file (`FeatureCard`, `IsoViewport`).

## Steps

1. Create the file in the right bucket above.
2. Define the component with the `#[component]` macro.
3. If it takes props, declare them as a `#[derive(Clone)]` struct named `{Component}Properties` in the same file. Simple single-value props can be plain function arguments; use the struct once you have more than one.
4. Add rustdoc comments on the component itself explaining its purpose; the project has a strict **no `//` line comments** rule, so all intent lives in doc comments.
5. Register the module in `src/lib.rs`: add `pub mod {name};` under the matching bucket's block.
6. Re-export alongside it: add `pub use {bucket}::{name}::{Component};` (or whatever the file exports) so consumers can write `use crate::components::Foo;`.
7. Wire it into `src/app.rs` (for page-level components) or into the relevant parent component.
8. Run `just lint` — the project enables every pedantic warning as an error.
9. Run `trunk build` to verify the WASM bundle compiles and Tailwind accepts the CSS you referenced.

## Design-language conventions

The site is styled as an engineering blueprint sheet. When scaffolding new components, match the existing drawing conventions rather than inventing new ones:

- **Outlines are 1px `var(--color-base-content)` on a `var(--color-base-100)` surface.** A 2px outline with `-3px` offset layered around a 1px border is the standard "framed drawing block" look (see `TitleBlock`, `LinkBadges`).
- **Typography** is monospace, uppercase, small caps via `letter-spacing: 0.08em` — see `.title-block-label` for the pattern.
- **Interactive elements** use the blueprint `lift` pop: `transform: translate(-2px, -2px)` + `box-shadow: 3px 3px 0 0 var(--shadow-drop)` on hover, reversed on active.
- **External links** require `target="_blank" rel="noopener noreferrer"`.
- **Static data** (link lists, marker positions, anything known at build time) goes in `const` slices at the top of the file.
- New CSS rules belong in `public/style.css` near related rules. Use `oklch(from var(--color-*) l c h / α)` when you need to derive a shade from the active theme; don't hardcode hex values that DaisyUI's `blueprint` theme would need to override.

## Async data

If the component fetches from the GitHub API (in `src/github.rs`), use `LocalResource::new` for the async binding — `Resource` would try to run the load on the host thread, which WASM cannot spawn.

## Verification

- `just lint` must pass clean (pedantic warnings are denied).
- `trunk build` must succeed; the WASM bundle size is budgeted at 500 KB in CI, so keep any new dependency usage tight.
