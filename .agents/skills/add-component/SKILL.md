---
name: add-component
description: Create a new UI component for the xodium.org Leptos site following the project's category conventions, props patterns, exports, and documentation.
---

# Add a New Component

Use this skill when the user wants to add a reusable component to the xodium.org Leptos app.

## Steps

1. Determine the component category:
   - `cards` — data cards like `ProjectCard` or `TeamCard`
   - `effects` — visual effects like `BlueprintGrid` or `ParallaxLanding`
   - `animations` — animated dividers like `LineDraw`
   - `ui` — primitive widgets like `CodeBlock` or `CornerFrame`
2. Create the file at `src/components/{category}/{component}.rs` using a lowercase, descriptive file name.
3. Define the component with the `#[component]` macro. The component name should be PascalCase (e.g., `FeatureCard`).
4. If the component accepts props, define a struct named `{Component}Properties` and derive `Clone`:

   ```rust
   #[derive(Clone)]
   pub struct FeatureCardProperties {
       pub title: String,
   }
   ```

5. Add rustdoc comments explaining the component's purpose and props.
6. Export the component:
   - Add `pub mod {component};` to `src/components/{category}/mod.rs`.
   - Add `pub use {category}::{component}::{Component};` to `src/components/mod.rs`.
7. If the component replaces or extends existing behavior, update any call sites.
8. Run `trunk build` to verify compilation.

## Conventions

- Keep components focused and reusable.
- Use Tailwind utility classes; DaisyUI classes are allowed.
- Static data should be defined as `const` slices at the top of the file.
- External links require `target="_blank" rel="noopener noreferrer"`.
- Async data inside components should use `LocalResource` and `data_grid`.

## Documentation

Update `ARCHITECTURE.md` if the new component belongs to an existing table. Add it to the relevant category table with file path and purpose.
