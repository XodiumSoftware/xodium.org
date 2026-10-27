---
name: leptos-component
description: Apply Leptos CSR patterns for the xodium.org project, including component macros, signals, resources, effects, and view syntax.
---

# Leptos Component Patterns for xodium.org

Use this skill when writing or reviewing Leptos components in the xodium.org CSR project.

## Core Patterns

- Define components with the `#[component]` macro. `#[must_use]` on the function makes accidental non-rendered calls into compile errors.
- Component names are PascalCase. File names are lowercase snake_case.
- Props structs (when used) are named `{Component}Properties` and derive `Clone`.
- The app is client-side-rendered (CSR) only; nothing mounts on the server.

## Reactivity

- Reach for `RwSignal` (read+write) by default; reach for a `(ReadSignal, WriteSignal)` split via `signal()` only when you need to pass a read-only half down a prop.
- `Signal<T>` is the read-only prop type when you want a child to _observe_ a parent's state without owning it.
- Prefer fine-grained signals over monolithic state structs — each piece of UI updates independently.
- Use `Effect::new(move |_| { ... })` for side effects that need to run when signals change. Inside an `Effect`, calls that touch browser APIs should bail out cleanly via `let Some(window) = web_sys::window() else { return };` when they can't be performed.
- A `move |...|` closure captures the _current_ value of any `RwSignal` it dereferences via `.get()`, so signal reactivity comes from the closure being placed somewhere the framework re-runs (a `view!` block, an `Effect`, a derived `Signal::derive`, etc.), not from the closure being recreated.

## Async Data

- Use `LocalResource::new(move || async move { ... })` for async work in the browser; `Resource` requires a server context that doesn't exist here.
- There is no `data_grid` helper anymore — that was removed with the old project sections. Handle the `Pending` / `Err` / `Ok` arms yourself where you consume the resource.

## Views

- Use the `view!` macro for markup.
- Tailwind utility classes go directly on elements; DaisyUI classes (`btn`, `tooltip`, `tooltip-left`, etc.) are fine.
- Conditional rendering: `move || cond.get()` closures, or `move || if ... { view!(...) } else { view!(...) }.into_any()` when the arms differ in type.
- Lists: `.into_iter().map(...).collect_view()` — or `.collect::<Vec<_>>()` when you need an intermediate shape.
- Inline styles that need to react to signals go through `style=move || format!(...)` on the element.

## Browser APIs

- `web-sys` for DOM / window / events, `js-sys` for JS types and reflection, `gloo-net` for HTTP, `gloo-timers` for async sleeps, `gloo-storage` for localStorage.
- When you need to attach an event listener outside the Leptos lifecycle (global keyboard shortcuts, resize handlers, etc.), build a `Closure::wrap(Box::new(...))`, register it via `add_event_listener_with_callback`, then `forget()` the closure so it lives for the page's lifetime. See `LinkBadges` in `src/components/ui/link_badges.rs` for the canonical pattern.
- JS pixel values (`inner_width`, `client_x`, etc.) arrive as `f64`; cast carefully and prefer keeping calculations in `f64` until you absolutely need an integer.

## Comments and docs

- The project bans `//` line comments entirely (see AGENTS.md). Anything that explains **why** something exists belongs in a `///` doc comment on the closest named item. If the reasoning is non-obvious, the function/component is a good candidate for a `///` block summarizing it.

## Pitfalls

- Do not use `Resource` for WASM-only async tasks. `LocalResource` is the only safe choice.
- `unsafe_code` is forbidden.
- `Closure::forget()` leaks deliberately; that's the correct way to keep a JS listener alive for the whole page. If you need cleanup, use `std::mem::forget` only if there's no drop path; otherwise prefer a scoped `Closure` that goes away when the component unmounts.
- Avoid `set_*.set(...)` inside closures that read the same signal — you can end up in update loops. Read via `.get()` on a `ReadSignal` and write via the paired `WriteSignal`.

## Verification

- `just lint` runs `cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings` and must pass clean.
- `just test` runs the WASM browser tests (`wasm-pack test --headless --chrome`); the tests live next to the code under `#[cfg(test)] mod tests { ... }`.
- `trunk build` verifies the bundle compiles; the CI release profile has a 500 KB size budget on the resulting `*_bg.wasm`.
