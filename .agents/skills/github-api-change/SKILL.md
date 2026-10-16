---
name: github-api-change
description: Modify the GitHub API client in xodium.org, including endpoints, caching, retries, and data structures, while keeping consumers and docs in sync.
---

# Modify the GitHub API Client

Use this skill when the user wants to change how the xodium.org site fetches data from GitHub.

## Key File

All GitHub data fetching is centralized in **`src/github.rs`**. There are currently no other fetchers.

## Public API surface

- `fetch_members() -> Result<Vec<Member>, String>` — org members, with `Owner`/`Member` role labels resolved via a second `role=admin` query for owners.
- `fetch_repos() -> Result<Vec<Repo>, String>` — public org repos, filtered to exclude forks and sorted by star count descending.
- `Member` and `Repo` — the response shapes consumed by callers.

Both wrap the internal helpers:

- `fetch<T>(endpoint)` — cache-then-network with exponential-backoff retry and stale-if-error fallback.
- `fetch_all<T>(endpoint)` — paginates `fetch` with `?page=N&per_page=100` until a short page is returned.

## Cache contract

- Cache key: `xodium:{endpoint}`.
- Timestamp: `{key}:ts` (ms since epoch).
- TTL: 5 minutes.
- Storage: `localStorage` via `gloo-storage`.
- On all refresh attempts failing, the cached entry is still served if present — a console warning notes the staleness instead of showing a user-facing error.

## Steps

1. Read `src/github.rs` to understand the current implementation.
2. Identify what you're changing:
    - New endpoint or query parameters
    - Response shape alterations
    - Cache TTL / retry / backoff tweaks
    - Error handling around 403/429/5xx
3. Edit `src/github.rs`.
4. Update rustdoc on the public function if the cache TTL, retry behaviour, or return shape changed.
5. If a response type changes, follow the field forward to whichever UI currently consumes it and rewire there. There are no UI consumers wired up yet — the call sites are the components that will be (re)built next, so the public API changes propagate cleanly.
6. `just lint` must stay clean.
7. `trunk build` to verify.

## Conventions

- Keep the 5-minute TTL unless you have a reason to change it; document any change in the function's rustdoc.
- Any new fetch function should also live in `src/github.rs` and follow the same cache/retry/stale-if-error pattern.
- Rate limit awareness: GitHub's unauthenticated cap is 60 req/hour per IP; pagination through `fetch_all` already multiplies calls.

## Testing

- WASM browser tests exist under `#[wasm_bindgen_test]` in `src/github.rs` — run them with `wasm-pack test --headless --chrome`, or `just test`.
- `trunk serve` + browser devtools Network/Application tabs are the manual verification loop.
