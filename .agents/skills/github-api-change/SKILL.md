---
name: github-api-change
description: Modify the GitHub API client in xodium.org, including endpoints, caching, retries, and data structures, while keeping call sites and docs in sync.
---

# Modify the GitHub API Client

Use this skill when the user wants to change how the xodium.org site fetches data from GitHub.

## Key File

All GitHub data fetching is centralized in `src/github.rs`.

## Steps

1. Read `src/github.rs` to understand the current implementation.
2. Identify what needs to change:
   - New endpoint or query parameters
   - Different response schema
   - Cache TTL adjustment
   - Retry/backoff behavior
   - Error handling
3. Update the relevant types, functions, or endpoints in `src/github.rs`.
4. If response structures change, update any component that consumes them (e.g., `ProjectCard`, `TeamCard`, `ProjectsSection`, `TeamDeckSection`).
5. If the public function signature changes, update call sites in `src/components/sections/`.
6. Update rustdoc comments in `src/github.rs` if endpoints, cache TTL, or function descriptions changed.
7. Run `cargo clippy --all-targets --all-features --target wasm32-unknown-unknown -- -W clippy::pedantic -D warnings` to ensure no lint issues.
8. Run `trunk build` to verify compilation.

## Conventions

- Cache keys follow the format `xodium:{endpoint}` with a timestamp key `{key}:ts`.
- Default TTL is 5 minutes; document any change.
- Use `LocalResource` for async in components, not `Resource`.
- `fetch<T>(endpoint)` is the internal cache-then-network helper with retry logic.
- Keep the retry limit and exponential backoff behavior consistent unless explicitly changing them.

## Testing

- There are no automated tests.
- Verify by running `trunk serve` and checking the browser console for fetch/cache behavior.
- Be mindful of GitHub's unauthenticated rate limit (60 requests/hour).
