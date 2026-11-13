---
name: add-component
description: Scaffold a new component or page section for the xodium.org Leptos CSR site, including file placement, prop conventions, module registration, and verification.
---

# Add a New Component

Use this skill when adding a component or page region to the xodium.org Leptos
app. It covers the scaffolding only: component patterns, CSS split and lint rules
live in `AGENTS.md`, and the rustdoc on each component explains its own layout.

## File placement

There are no `mod.rs` files anywhere; every module is declared in `src/lib.rs`.
Components live in one of four buckets, and the bucket decides both the path and
the block in `src/lib.rs`:

| Bucket                                         | Path                                |
| ---------------------------------------------- | ----------------------------------- |
| Page band (a region of the single-page layout) | `src/components/layout/{name}.rs`   |
| UI primitive                                   | `src/components/ui/{name}.rs`       |
| Icon                                           | `src/components/ui/icons/{name}.rs` |
| Background effect                              | `src/components/effects/{name}.rs`  |

A page band is a `<section class="sheet-band ...">` stacked inside `Main`; add it
to the band tables and the page-layout reading order in `AGENTS.md` as well. A
component that never joins the page layout needs no `AGENTS.md` edit.

File names are lowercase snake_case (`feature_card.rs`); component names are
PascalCase matching the file (`FeatureCard`).

## Props

Props are plain function arguments while there is one of them. Move to a
`#[derive(Clone)]` struct named `{Component}Properties` once there are two or
more, or as soon as a caller needs to pass the set as a value.

```rust
#[derive(Clone)]
pub struct FeatureCardProperties {
    /// Heading rendered in the card.
    pub title: &'static str,
}
```

Build-time data (link lists, card contents, row order) goes in `const` slices at
the top of the component file, not in the props.

## Steps

1. Create the file in the bucket above.
2. Define the component with `#[component]`, and `#[must_use]` on the function so
   a forgotten render is a compile error.
3. Add rustdoc explaining purpose, and any layout constraint whose removal would
   cause a bug a reader could not spot locally.
4. Register the module: add `pub mod {name};` inside the matching block in
   `src/lib.rs` (`pub mod components { pub mod layout { .. } }` and so on).
5. Re-export it next to the other `pub use` lines in `src/lib.rs`, so consumers
   can write `use crate::components::{Component};`.
6. Wire it into `src/app.rs` (page bands) or the parent component.

## Verification

- `just lint` — clippy with `-W clippy::pedantic -D warnings`; every warning is
  an error. `missing_docs` is denied, so every public item needs rustdoc.
- `trunk build` — confirms the WASM bundle compiles and Tailwind resolves the
  utilities you referenced.
