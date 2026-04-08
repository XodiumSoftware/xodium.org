#!/usr/bin/env sh
set -eu

# DAISYUI_VERSION is expected to be set via Trunk.toml [env] section
if [ -z "${DAISYUI_VERSION:-}" ]; then
    echo "Error: DAISYUI_VERSION environment variable is not set" >&2
    echo "This script should be run via Trunk which sets the variable from Trunk.toml" >&2
    exit 1
fi

BASE_URL="https://github.com/saadeghi/daisyui/releases/download/v${DAISYUI_VERSION}"
SENTINEL="public/.daisyui-version"

if [ -f "$SENTINEL" ] && [ "$(cat "$SENTINEL")" = "$DAISYUI_VERSION" ]; then
    exit 0
fi

echo "Fetching daisyui v${DAISYUI_VERSION}..."
curl -fsSL "${BASE_URL}/daisyui.mjs" -o "public/daisyui.mjs"
curl -fsSL "${BASE_URL}/daisyui-theme.mjs" -o "public/daisyui-theme.mjs"
printf "%s" "$DAISYUI_VERSION" > "$SENTINEL"
