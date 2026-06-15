#!/bin/bash
set -euo pipefail

INPUT=$(cat)

# Prevent infinite loops
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
    echo '{"decision": "approve"}'
    exit 0
fi

TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
    echo '{"decision": "approve"}'
    exit 0
fi

# Find TypeScript files edited in this session
EDITED_TS=$(while IFS= read -r line; do
    [ -z "$line" ] && continue
    tool_name=$(echo "$line" | jq -r '.message.content[]?.name // empty' 2>/dev/null || true)
    if [[ "$tool_name" =~ ^(Write|Edit)$ ]]; then
        file_path=$(echo "$line" | jq -r '.message.content[]?.input.file_path // empty' 2>/dev/null || true)
        if [ -n "$file_path" ] && [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
            echo "$file_path"
        fi
    fi
done < "$TRANSCRIPT_PATH" | sort -u)

# Filter to files that still exist on disk (deleted files must not be linted)
EDITED_TS=$(echo "$EDITED_TS" | while IFS= read -r f; do
    [ -f "$f" ] && echo "$f"
done)

# No TypeScript files touched (or all were deleted) — nothing to check
if [ -z "$EDITED_TS" ]; then
    echo '{"decision": "approve"}'
    exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

ERRORS=""

# Lint only the edited files (faster than project-wide lint)
LINT_OUTPUT=$(echo "$EDITED_TS" | xargs ./node_modules/.bin/eslint --max-warnings 0 2>&1) || ERRORS="$ERRORS
### Lint:
$LINT_OUTPUT"

# Detect monorepo: check whether any packages/*/package.json exists.
HAS_PACKAGES=false
for pkg_json in packages/*/package.json; do
    [ -f "$pkg_json" ] && HAS_PACKAGES=true && break
done

if [ "$HAS_PACKAGES" = "true" ]; then
    TOUCHED_SHARED=false
    TYPECHECK_PKGS=""

    while IFS= read -r f; do
        for pkg_json in packages/*/package.json; do
            [ -f "$pkg_json" ] || continue
            pkg_dir=$(dirname "$pkg_json")
            if [[ "$f" == *"$pkg_dir/"* ]]; then
                pkg_name=$(jq -r '.name' "$pkg_json")
                if [[ "$pkg_name" == *common* ]] || [[ "$pkg_name" == *shared* ]]; then
                    TOUCHED_SHARED=true
                else
                    TYPECHECK_PKGS="$TYPECHECK_PKGS $pkg_name"
                fi
            fi
        done
    done <<< "$EDITED_TS"

    if [ "$TOUCHED_SHARED" = "true" ]; then
        TYPECHECK_PKGS=""
        for pkg_json in packages/*/package.json; do
            [ -f "$pkg_json" ] || continue
            TYPECHECK_PKGS="$TYPECHECK_PKGS $(jq -r '.name' "$pkg_json")"
        done
    fi

    TYPECHECK_PKGS=$(echo "$TYPECHECK_PKGS" | tr ' ' '\n' | sort -u | grep -v '^$' || true)

    if [ -n "$TYPECHECK_PKGS" ]; then
        while IFS= read -r pkg; do
            [ -z "$pkg" ] && continue
            TYPE_OUTPUT=$(pnpm --filter "$pkg" typecheck 2>&1) || ERRORS="$ERRORS
### Typecheck ($pkg):
$TYPE_OUTPUT"
        done <<< "$TYPECHECK_PKGS"
    fi
else
    TYPE_OUTPUT=$(pnpm typecheck 2>&1) || ERRORS="$ERRORS
### Typecheck:
$TYPE_OUTPUT"
fi

if [ -n "$ERRORS" ]; then
    REASON="Quality checks failed — fix before stopping:$ERRORS"
    echo "$REASON" | jq -Rs '{"decision": "block", "reason": .}'
    exit 0
fi

echo '{"decision": "approve"}'
