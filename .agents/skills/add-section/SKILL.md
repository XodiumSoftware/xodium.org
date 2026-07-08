---
name: add-section
description: Scaffold a new page section for the xodium.org Leptos CSR site, including component file, exports, App integration, and divider.
---

# Add a New Page Section

Use this skill when the user wants to add a new page section to the xodium.org single-page Leptos app.

## Steps

1. Choose a file name under `src/components/sections/{section}.rs` where `{section}` is short, lowercase, and descriptive (e.g., `mission`, `contact`).
2. Create the section component with the `#[component]` macro. The component name should be PascalCase (e.g., `MissionSection`).
3. Add a props struct only if the section accepts external data; otherwise omit props. If used, name it `{Section}Properties` and derive `Clone`.
4. Export the new section:
   - Add `pub mod {section};` to `src/components/sections/mod.rs`.
   - Add `pub use sections::{section}::{Section};` to `src/components/mod.rs`.
5. Import the section in `src/app.rs` and place it in the page layout where appropriate.
6. Add a `LineDraw` divider before and/or after the section to match the existing layout pattern.
7. Run `cargo clippy --all-targets --all-features -- -D warnings` to ensure no lint issues.
8. Run `trunk build` to verify compilation.

## Conventions

- Sections live in `src/components/sections/`.
- Use Tailwind utility classes and DaisyUI components from `public/style.css`.
- For async data, use `LocalResource` and wrap with `data_grid`.
- External links must use `target="_blank" rel="noopener noreferrer"`.
- Add rustdoc comments for the component and any public props.

## Example

A new `MissionSection` would go in `src/components/sections/mission.rs`, be exported through `src/components/sections/mod.rs` and `src/components/mod.rs`, and imported in `src/app.rs`.
