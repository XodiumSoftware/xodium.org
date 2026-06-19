---
name: update-architecture
description: Keep ARCHITECTURE.md in sync with code changes for the xodium.org project.
---

# Update ARCHITECTURE.md

Use this skill whenever a code change affects the structure described in `ARCHITECTURE.md`.

## When to Update

Update `ARCHITECTURE.md` if the code change would confuse someone reading the docs. Common triggers:

- A new component, section, or card is added.
- A component is removed or renamed.
- The page layout in `App` changes.
- The GitHub API endpoints, cache TTL, or functions change.
- The styling approach or build pipeline changes.
- A new file or module is introduced.

## Steps

1. Read the relevant section of `ARCHITECTURE.md`.
2. Make the minimal update needed to keep the doc accurate:
   - Add/remove rows in component tables.
   - Update the Page Layout list if section order changed.
   - Update file paths if a component moved.
   - Update the GitHub API table if endpoints or cache TTL changed.
3. Keep descriptions concise and match the existing table style.
4. Do not add speculative or future plans; only document what exists.

## Tables to Keep Current

- **Page Layout** — ordered list of sections in `App`.
- **Sections** — `src/components/sections/`.
- **Cards** — `src/components/cards/`.
- **Visual Effects** — `src/components/effects/`.
- **Animations** — `src/components/animations/`.
- **UI Primitives** — `src/components/ui/`.
- **GitHub API** — endpoints, cache TTL, and functions.
- **Project Structure** — directory tree.

## Verification

After updating, run `trunk build` to confirm the code still compiles. If `ARCHITECTURE.md` references new files, verify those files exist.
