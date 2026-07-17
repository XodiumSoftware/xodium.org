# auth.md

This document describes how AI agents can register and authenticate with **Xodium** (`https://xodium.org`).

## Audience

This registration flow is intended for autonomous agents and agent platforms that want to interact with Xodium's public resources.

## Resource server

- **Resource identifier:** `https://xodium.org/`
- **OAuth Protected Resource Metadata:** [`https://xodium.org/.well-known/oauth-protected-resource`](https://xodium.org/.well-known/oauth-protected-resource)
- **Bearer method:** `header`

## Authorization servers

Xodium's public website does not currently require authentication. The protected resource metadata above lists no authorization servers. When protected APIs are introduced, the metadata will be updated with the issuing authorization server(s).

## Registration

- **Registration endpoint:** [`https://xodium.org/auth.md`](https://xodium.org/auth.md)
- **Supported identity type:** `anonymous`
- **Supported credential type:** `none`
- **Claim URI:** [`https://xodium.org/auth.md`](https://xodium.org/auth.md)

For anonymous access, no credentials are required. Agents should treat all endpoints as public and read-only unless future metadata states otherwise.

## Revocation

No revocation endpoint is provided because anonymous credentials are not issued.
