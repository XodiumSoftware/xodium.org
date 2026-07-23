# xodium.org Pedantic Clippy Cleanup

Tracking the remaining `-W clippy::pedantic` warnings in `xodium.org` so they can be fixed incrementally.

## Status

- Build script (`build.rs`) fixed.
- Auto-fixable lints applied via `cargo clippy --fix`.
- Remaining warnings require manual decisions or refactoring.

## Remaining Lint Categories

### 1. `clippy::must_use_candidate` — Leptos components and helpers

**Count:** many functions across the component tree.

**Rationale for allowing:**
- Leptos components are used inside the `view!` macro; `#[must_use]` on `fn ...() -> impl IntoView` is rarely meaningful in this framework.
- Most simple getters/helpers also trigger this lint.

**Options:**
- Add crate-level `#![allow(clippy::must_use_candidate)]` in `src/lib.rs`.
- Or add `#[must_use]` to every flagged function.

**Decision needed:** allow globally or add attributes per function.

### 2. `clippy::too_many_lines` — oversized component functions

**Affected functions:**
- `Header` (`src/components/sections/header.rs`)
- `TeamDeckSection` (`src/components/sections/team_deck.rs`)
- `CodeBlock` (`src/components/ui/code_block.rs`)
- `BlueprintGrid` (`src/components/ui/effects/blueprint_grid.rs`)
- `WireframeShapes` (`src/components/ui/effects/wire_frames.rs`)

**Options:**
- Refactor each component by extracting helper functions / sub-components.
- Or allow the lint globally / per function.

**Decision needed:** refactor or allow.

### 3. `clippy::uninlined_format_args` — format strings with simple variables

**Example:**
```rust
format!("{} bg-...", base)
```

**Fix:** inline the variables:
```rust
format!("{base} bg-...")
```

**Effort:** trivial; can be applied automatically with `cargo clippy --fix` for these cases.

### 4. `clippy::redundant_closure_for_method_calls`

**Example:** `.map(|s| s.to_owned())` → `.map(str::to_owned)` or `std::borrow::ToOwned::to_owned`.

**Effort:** trivial auto-fix.

### 5. `clippy::assigning_clones` — `.clone()` assigned to a field

**Example:** `card.favorites = updated.favorites.clone()` → `card.favorites.clone_from(&updated.favorites)`.

**Effort:** trivial; apply `clone_from()`.

### 6. `clippy::missing_errors_doc` — `Result`-returning functions missing `# Errors`

**Files:** `src/github.rs`

**Fix:** add `# Errors` sections to the rustdoc comments of the flagged functions explaining what error conditions callers can expect.

### 7. `clippy::float_cmp` — strict float comparison

**File:** `src/github.rs:181`

**Fix:**
- If comparing timestamps/status codes stored as floats, consider comparing integers or using an epsilon.
- If the comparison is intentionally exact, add `#[allow(clippy::float_cmp)]` with a comment explaining why.

### 8. `clippy::map_unwrap_or` — one occurrence in `header.rs`

**Fix:** use `is_some_and` or `map_or` / `map_or_else` as suggested by clippy.

## Suggested First Steps

1. Run `cargo clippy --fix --allow-dirty --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings` to knock out auto-fixable lints.
2. Decide whether to allow `must_use_candidate` and `too_many_lines` globally.
3. Fix `missing_errors_doc`, `float_cmp`, and the remaining `map_unwrap_or` manually.
4. Run `trunk build` and `cargo fmt --check` to verify.

## Verification Commands

```bash
# Pedantic clippy
cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings

# Release build
trunk build --release

# Format check
cargo fmt --all -- --check
```
