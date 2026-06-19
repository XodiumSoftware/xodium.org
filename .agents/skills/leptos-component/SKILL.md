---
name: leptos-component
description: Apply Leptos CSR patterns for the xodium.org project, including component macros, signals, resources, effects, and view syntax.
---

# Leptos Component Patterns for xodium.org

Use this skill when writing or reviewing Leptos components in the xodium.org CSR project.

## Core Patterns

- Define components with the `#[component]` macro.
- Component names are PascalCase. File names are lowercase.
- Props structs are named `{Component}Properties` and derive `Clone`.
- The app is client-side rendered (CSR) only — no SSR concerns.

## Reactivity

- Use `RwSignal`, `ReadSignal`, `Signal`, and `Memo` as appropriate.
- Prefer fine-grained signals over large reactive objects.
- Use `Effect::new` for side effects that run when signals change.

## Async Data

- In WASM, use `LocalResource::new` (not `Resource`) so async runs on the WASM thread.
- Wrap async sections with the `data_grid` helper from `src/components/ui/datagrid.rs`.
- Example:

  ```rust
  let repos = LocalResource::new(move || async move {
      fetch_repos().await.unwrap_or_default()
  });
  ```

## Views

- Use the `view!` macro for markup.
- Tailwind classes go directly on elements.
- For conditional rendering, use `move ||` closures or signal-derived conditions.
- For lists, use `.into_iter().map(...).collect_view()`.

## Browser APIs

- Access browser APIs through `web-sys` and `js-sys`.
- Use `gloo-net` for HTTP requests.
- Use `gloo-timers` for async timers.

## Pitfalls

- Do not use `Resource` for WASM-only async tasks.
- Avoid `unsafe_code`; it is not needed in this WASM sandbox.
- Do not inline ad-hoc `Suspense` boundaries; use `data_grid`.

## Verification

Run `trunk build` after component changes. There are no automated tests, so manual browser verification with `trunk serve` is required.
