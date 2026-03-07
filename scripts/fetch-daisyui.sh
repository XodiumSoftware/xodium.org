#!/bin/sh
set -eu

DAISYUI_VERSION="5.5.19"
BASE_URL="https://github.com/saadeghi/daisyui/releases/download/v${DAISYUI_VERSION}"
SENTINEL="public/.daisyui-version"

if [ -f "$SENTINEL" ] && [ "$(cat "$SENTINEL")" = "$DAISYUI_VERSION" ]; then
    exit 0
fi

echo "Fetching daisyui v${DAISYUI_VERSION}..."
curl -sLo public/daisyui.mjs "${BASE_URL}/daisyui.mjs"
curl -sLo public/daisyui-theme.mjs "${BASE_URL}/daisyui-theme.mjs"
echo "$DAISYUI_VERSION" > "$SENTINEL"
