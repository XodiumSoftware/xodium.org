---
name: github-api-change
description: Modify the GitHub API client in xodium.org, including endpoints, caching, retries, and data structures, while keeping consumers and docs in sync.
---

# Modify the GitHub API Client

Use this skill when changing how the site fetches data from GitHub. All GitHub
data fetching is centralized in `src/github.rs`; the cache contract below is
shared by every function there, so a change to one endpoint must keep working
through the same helpers.

The module's own rustdoc and function docs describe the current endpoints,
signatures and constants. Read them rather than trusting a list here: they are
edited as part of the change, and this file deliberately does not restate them.

## The cache contract

Every fetch goes through the same cache-then-network path, and these properties
must survive any change:

- Key: `xodium:v{CACHE_SCHEMA_VERSION}:{endpoint}`, with the timestamp in a
  sibling `{key}:ts` entry. **Bump `CACHE_SCHEMA_VERSION` whenever a cached
  payload's shape changes** — that is what makes old entries fail to deserialize
  by construction instead of poisoning the UI.
- Poisoned entries cost one fetch: a payload that will not deserialize is
  deleted together with its timestamp.
- Stale-if-error: if every refresh attempt fails, an expired entry is still
  served with a console warning. A cache read must never surface an error to the
  user when it has something usable.
- Retries use exponential backoff from the base delay, and pagination walks
  `?page=N&per_page=PER_PAGE` until a short page returns.

## Steps

1. Read `src/github.rs` before editing — the helpers decide what a new endpoint
   gets for free.
2. Make the change: endpoint, query parameters, response shape, TTL/retry
   tuning, or error handling.
3. If a cached payload type changed shape, bump `CACHE_SCHEMA_VERSION` in the
   same commit. Missing this is the one mistake that survives review: it only
   shows up for users who already have the old entry.
4. Update the rustdoc on the public function when the return shape, TTL or
   retry behaviour changed. If a shape changed, follow every field forward to
   the components that render it; they live under `src/components/layout/` and
   are found with a search for the function's name.
5. Check `src/github.rs`'s tests still describe the behaviour. Constants,
   cache keys and eviction are all asserted there, so a deliberate change to one
   of them means updating the test alongside it.
6. `just lint` and `just test`, then `trunk build`.

## Conventions

- A new fetch belongs in `src/github.rs` and reuses the existing helpers, so it
  inherits the cache, retry and stale-if-error behaviour rather than growing a
  second implementation.
- Keep the existing TTL unless there is a reason; record any change in the
  function's rustdoc.
- Unauthenticated GitHub allows 60 requests per hour per IP, and
  pagination multiplies calls. Prefer one endpoint over many, and let the cache
  absorb repeat visits.

## Testing

`just test` runs the browser tests (`wasm-pack test --headless --firefox`). They
need no network: they exercise the cache, keys, backoff delays and
deserialization against fixtures. Manual verification is `trunk serve` plus the
devtools Network and Application tabs, watching for cache hits on reload.
