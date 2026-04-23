# Installation

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build from Source](#build-from-source)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Rust](https://rustup.rs/) (latest stable version)
- [Trunk](https://trunkrs.dev/) — WASM web app bundler

### Install Trunk

```bash
cargo install trunk
```

## Build from Source

Build the website for production deployment.

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/XodiumSoftware/xodium.org.git
   cd xodium.org
   ```

2. Build for release:
   ```bash
   trunk build --release
   ```

3. The output is in `dist/` directory, ready for deployment

## Development

Run a local development server with hot-reload.

### Start Dev Server

```bash
trunk serve
```

The site will be available at `http://localhost:8080` (or another port if 8080 is in use).

### Live Reload

Trunk automatically rebuilds and reloads the browser when you save changes.

### Build Commands

```bash
# Development build
trunk build

# Release build (optimized)
trunk build --release

# Serve with specific port
trunk serve --port 3000
```

## Deployment

The site is automatically deployed to Cloudflare Pages via GitHub Actions.

### Automatic Deployment

On every push to `main`:

1. GitHub Actions builds the site with `trunk build --release`
2. The `dist/` directory is deployed to Cloudflare Pages
3. The site is available at [xodium.org](https://xodium.org)

### Manual Deployment

To deploy manually to Cloudflare Pages:

1. Build the site:
   ```bash
   trunk build --release
   ```

2. Deploy using Wrangler:
   ```bash
   npx wrangler pages deploy dist --project-name=xodiumorg
   ```

### Environment Variables

For GitHub Actions deployment, set these secrets:

| Secret                  | Description                                      |
|-------------------------|--------------------------------------------------|
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token with Pages edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID                       |

## Project Structure

```
xodium.org/
├── src/
│   ├── main.rs           # WASM entry point
│   ├── lib.rs            # Crate root
│   ├── app.rs            # Main App component
│   ├── components/       # UI components
│   │   ├── animations/   # LineDraw, etc.
│   │   ├── cards/        # ProjectCard, TeamCard
│   │   ├── effects/      # Visual effects
│   │   ├── sections/     # Header, Footer, etc.
│   │   └── ui/           # UI primitives
│   └── github.rs         # GitHub API client
├── public/
│   ├── style.css         # Tailwind + DaisyUI styles
│   └── icons/            # SVG icons
├── index.html            # HTML template
├── Trunk.toml            # Trunk configuration
└── Cargo.toml            # Rust dependencies
```

## Troubleshooting

### "trunk: command not found"

- Install Trunk: `cargo install trunk`
- Ensure `~/.cargo/bin` is in your PATH

### Build fails with WASM errors

- Install wasm32 target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```

### CSS not updating

- Trunk watches `style.css` automatically
- Try clearing browser cache (Ctrl+Shift+R)
- Restart `trunk serve` if needed

### GitHub API rate limiting

The site caches GitHub API responses in `localStorage` with a 5-minute TTL. If you see:

- Empty project/team sections: API rate limit may be exceeded
- Wait a few minutes and refresh, or clear site data

### Deploy failed

- Verify `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets are set
- Check token has Pages edit permissions
- Ensure `dist/` directory exists and contains files

### Large binary size

The release profile is already optimized for size:

- `opt-level = "z"` — optimize for size
- `lto = true` — link-time optimization
- `codegen-units = 1` — slower but better optimization
- `panic = "abort"` — smaller panic handler
- `strip = true` — remove debug symbols

If size is still an issue, check for large dependencies in `Cargo.toml`.

---

<p align="right"><a href="#readme-top">▲</a></p>
