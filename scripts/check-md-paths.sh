#!/bin/sh
# Verify that repository paths named in Markdown files actually exist.
#
# Markdown prose drifts away from the tree: a renamed file or a deleted
# directory leaves a stale reference behind that no compiler or link checker
# will notice, because these paths appear as inline code, not as links.
#
# Only tokens containing a path separator and starting with a known top-level
# directory (src/, public/, scripts/, .github/, .agents/) are checked. Bare
# filenames are skipped on purpose: tables in AGENTS.md list `main.rs` under a
# heading that names the directory, and a `mod.rs` may be cited precisely
# because it does not exist. Checking those would bury the real signal.
#
# Fenced code blocks are skipped, since they hold illustrative examples such as
# `src/components/ui/{name}.rs`. Any token containing a brace, angle bracket,
# wildcard, or other replacement marker is ignored for the same reason.
#
# Usage: scripts/check-md-paths.sh
set -eu

cd "$(dirname "$0")/.."

list=$(mktemp)
trap 'rm -f "$list"' EXIT

find . -name '*.md' \
    -not -path './target/*' \
    -not -path './dist/*' \
    -not -path './node_modules/*' \
    | sort \
    | while IFS= read -r md; do
        awk '
            /^[[:space:]]*(```|~~~)/ { fence = !fence; next }
            !fence { print }
        ' "$md" \
            | grep -oE '`[^`]+`' \
            | tr -d '`' \
            | tr -d '()<>"'"'"',' \
            | grep -E '^(src|public|scripts|\.github|\.agents)/' \
            | while IFS= read -r token; do
                printf '%s\t%s\n' "$md" "$token"
            done
    done > "$list"

failures=0
checked=0

while IFS="$(printf '\t')" read -r md token; do
    case "$token" in
        *'{'*|*'}'*|*'*'*|*'?'*|*'|'*|*'$'*|*'<'*|*'>'*) continue ;;
    esac

    # A reference may carry a trailing annotation such as ":20"; drop it.
    token=${token%%:*}
    [ -n "$token" ] || continue

    checked=$((checked + 1))

    if [ ! -e "$token" ]; then
        printf '%s: missing path: %s\n' "$md" "$token"
        failures=$((failures + 1))
    fi
done < "$list"

if [ "$failures" -gt 0 ]; then
    printf '\n%d missing path reference(s) across %d checked.\n' "$failures" "$checked"
    printf 'Update the Markdown, or the path, so the docs match the tree.\n'
    exit 1
fi

printf 'All %d referenced paths exist.\n' "$checked"
