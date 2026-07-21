---
name: add-component
description: Scaffold a new component or page section for the xodium.org Leptos CSR site, including file placement, props, exports, App integration, and verification.
---

# Add a New Component or Section

Use this skill when the user wants to add a new component or page section to the xodium.org Leptos app.

## Steps

1. Decide whether the new item is a **reusable component** or a **page section**:
   - **Reusable component** — a focused, reusable piece of UI.
     - `cards` — data cards like `ProjectCard` or `TeamCard`
     - `effects` — visual effects like `BlueprintGrid` or `ParallaxLanding`
     - `animations` — animated dividers like `LineDraw`
     - `ui` — primitive widgets like `CodeBlock` or `CornerFrame`
   - **Page section** — a full section of the single-page layout in `src/components/sections/`.
2. Choose a file name:
   - Reusable component: `src/components/{category}/{component}.rs` (lowercase, descriptive, e.g., `featurecard.rs`).
   - Page section: `src/components/sections/{section}.rs` (lowercase, descriptive, e.g., `mission.rs`).
3. Define the component with the `#[component]` macro. Component names are PascalCase (e.g., `FeatureCard`, `MissionSection`).
4. If the component accepts props, define a struct named `{Component}Properties` and derive `Clone`:

   ```rust
   #[derive(Clone)]
   pub struct FeatureCardProperties {
       pub title: String,
   }
   ```

5. Add rustdoc comments explaining the component's purpose and any public props.
6. Export the component:
   - Add `pub mod {file_name};` to the category's `mod.rs` (`src/components/{category}/mod.rs` or `src/components/sections/mod.rs`).
   - Add `pub use {category}::{file_name}::{ComponentName};` to `src/components/mod.rs`.
7. Wire it into the app:
   - **Reusable component:** import it where needed and use it in the relevant section or card.
   - **Page section:** import it in `src/app.rs`, place it in the page layout where appropriate, and add `LineDraw` dividers before and/or after it to match the existing layout pattern.
8. Run `cargo clippy --all-targets --all-features -- -D warnings` to ensure no lint issues.
9. Run `trunk build` to verify compilation.

## Conventions

- Keep components focused and reusable.
- Use Tailwind utility classes; DaisyUI classes are allowed.
- Static data should be defined as `const` slices at the top of the file.
- External links require `target="_blank" rel="noopener noreferrer"`.
- Async data inside components should use `LocalResource` and `data_grid`.
- Page sections live in `src/components/sections/` and are composed in `src/app.rs`.

## Examples

- A new `FeatureCard` would go in `src/components/cards/featurecard.rs`, be exported through `src/components/cards/mod.rs` and `src/components/mod.rs`, and used inside an existing section.
- A new `MissionSection` would go in `src/components/sections/mission.rs`, be exported through `src/components/sections/mod.rs` and `src/components/mod.rs`, and placed in `src/app.rs` between `LineDraw` dividers.
