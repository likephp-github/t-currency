#!/usr/bin/env bash
#
# link-memory.sh — point the Claude Code harness memory dir at this repo,
# merging any pre-existing machine-local memory into the repo first.
#
# What it does:
#   1. Merge ~/.claude/projects/<key>/memory  ->  <repo>/.claude/memory
#        - new files            : copied in
#        - identical files      : skipped
#        - MEMORY.md (the index): line-union merged (unique lines kept)
#        - other conflicts      : repo version kept; incoming saved as
#                                 <file>.incoming-<host>-<ts> for manual review
#   2. Back up the harness memory dir to memory.bak-<ts>
#   3. Symlink the harness memory dir to the repo memory dir
#
# Usage:
#   ./link-memory.sh [--mem-dir REL]    repo-relative memory dir (default: .claude/memory)
#                    [--launch-dir DIR] dir Claude is launched from (default: repo root)
#                    [--key NAME]       harness folder name override (under ~/.claude/projects/)
#                    [--fix-gitignore]  append an un-ignore rule if the memory dir is gitignored
#                    [-y|--yes]         skip the confirmation prompt
#
set -euo pipefail

MEM_REL=".claude/memory"
LAUNCH_DIR=""
KEY_OVERRIDE=""
ASSUME_YES=0
FIX_GITIGNORE=0

while [ $# -gt 0 ]; do
  case "$1" in
    --mem-dir)       MEM_REL="${2:?}"; shift 2 ;;
    --launch-dir)    LAUNCH_DIR="${2:?}"; shift 2 ;;
    --key)           KEY_OVERRIDE="${2:?}"; shift 2 ;;
    --fix-gitignore) FIX_GITIGNORE=1; shift ;;
    -y|--yes)        ASSUME_YES=1; shift ;;
    -h|--help)    sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; exit 2 ;;
  esac
done

# --- resolve paths -----------------------------------------------------------
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [ -z "$REPO_ROOT" ]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"   # assume script lives in <repo>/scripts/
fi

[ -n "$LAUNCH_DIR" ] || LAUNCH_DIR="$REPO_ROOT"
LAUNCH_DIR="$(cd "$LAUNCH_DIR" && pwd)"

# harness folder name = launch dir path with every non-alphanumeric char turned
# into '-' (so '/', '.', etc. all become '-'). Override with --key if it differs.
if [ -n "$KEY_OVERRIDE" ]; then
  KEY="$KEY_OVERRIDE"
else
  KEY="$(printf '%s' "$LAUNCH_DIR" | sed 's:[^A-Za-z0-9]:-:g')"
fi
PROJECT_DIR="$HOME/.claude/projects/$KEY"
HARNESS_MEM="$PROJECT_DIR/memory"

# Safety net: if the computed key has no matching folder, the derivation may not
# match this harness version. Warn and show candidates so the user can pass --key.
if [ ! -d "$PROJECT_DIR" ] && [ -z "$KEY_OVERRIDE" ]; then
  echo "WARNING: no harness folder at $PROJECT_DIR" >&2
  echo "If Claude has run in this repo before, the key may differ. Candidates:" >&2
  ls "$HOME/.claude/projects/" 2>/dev/null | grep -i "$(basename "$LAUNCH_DIR" | sed 's:[^A-Za-z0-9]:-:g')" >&2 || true
  echo "Re-run with --key <name> if one of the above matches, or continue to create a fresh link." >&2
  echo >&2
fi

case "$MEM_REL" in
  /*) REPO_MEM="$MEM_REL" ;;
  *)  REPO_MEM="$REPO_ROOT/$MEM_REL" ;;
esac

TS="$(date +%Y%m%d-%H%M%S)"
HOST="$(hostname -s 2>/dev/null || hostname || echo host)"
BAK="$PROJECT_DIR/memory.bak-$TS"

echo "Repo root      : $REPO_ROOT"
echo "Launch dir     : $LAUNCH_DIR"
echo "Harness key    : $KEY"
echo "Harness memory : $HARNESS_MEM"
echo "Repo memory    : $REPO_MEM"
echo

# --- gitignore guard ---------------------------------------------------------
# A blanket rule (e.g. /.claude) silently keeps the memory dir out of git, which
# defeats the whole point. Detect it; warn, and optionally append an un-ignore
# rule that re-includes only the memory dir while leaving siblings ignored.
if git -C "$REPO_ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  MEM_REL_GIT="${REPO_MEM#"$REPO_ROOT"/}"
  if git -C "$REPO_ROOT" check-ignore -q "$MEM_REL_GIT" 2>/dev/null; then
    GI="$REPO_ROOT/.gitignore"
    MARK="# claude-link-memory: keep $MEM_REL_GIT in git"
    block="$MARK"$'\n'
    acc=""; IFS='/' read -ra _parts <<< "$MEM_REL_GIT"
    last=$(( ${#_parts[@]} - 1 ))
    for i in "${!_parts[@]}"; do
      acc="${acc:+$acc/}${_parts[$i]}"
      block+="!$acc/"$'\n'
      # re-exclude an ancestor's other children only if that ancestor is itself ignored
      if [ "$i" -lt "$last" ] && git -C "$REPO_ROOT" check-ignore -q "$acc" 2>/dev/null; then
        block+="$acc/*"$'\n'
      fi
    done
    echo "WARNING: '$MEM_REL_GIT' is gitignored — memory would NOT be committed." >&2
    if grep -qF "$MARK" "$GI" 2>/dev/null; then
      echo "  (un-ignore rule already present in .gitignore, but path still ignored — check ordering)" >&2
    elif [ "$FIX_GITIGNORE" -eq 1 ]; then
      printf '\n%s' "$block" >> "$GI"
      echo "  -> appended un-ignore rule to $GI" >&2
    else
      echo "  Re-run with --fix-gitignore, or append to $GI:" >&2
      printf '%s' "$block" | sed 's/^/    /' >&2
    fi
    echo >&2
  fi
fi

# --- already linked? ---------------------------------------------------------
if [ -L "$HARNESS_MEM" ] && [ "$(readlink -f "$HARNESS_MEM")" = "$(readlink -f "$REPO_MEM" 2>/dev/null || echo "$REPO_MEM")" ]; then
  echo "Already linked to the repo memory. Nothing to do."
  exit 0
fi

# --- confirm -----------------------------------------------------------------
if [ "$ASSUME_YES" -ne 1 ]; then
  printf 'Proceed with merge + symlink? [y/N] '
  read -r reply
  case "$reply" in y|Y|yes|YES) ;; *) echo "Aborted."; exit 1 ;; esac
fi

mkdir -p "$REPO_MEM" "$PROJECT_DIR"

# --- merge (only when harness memory is a real directory) --------------------
added=0; skipped=0; index_merged=0; conflicts=()

if [ -d "$HARNESS_MEM" ] && [ ! -L "$HARNESS_MEM" ]; then
  while IFS= read -r -d '' s; do
    rel="${s#"$HARNESS_MEM"/}"
    d="$REPO_MEM/$rel"
    if [ ! -e "$d" ]; then
      mkdir -p "$(dirname "$d")"
      cp -p "$s" "$d"; added=$((added+1))
    elif cmp -s "$s" "$d"; then
      skipped=$((skipped+1))
    elif [ "$rel" = "MEMORY.md" ]; then
      tmp="$(mktemp)"
      awk '!seen[$0]++' "$d" "$s" > "$tmp"   # union, repo lines first
      mv "$tmp" "$d"; index_merged=1
    else
      cp -p "$s" "$d.incoming-$HOST-$TS"; conflicts+=("$rel")
    fi
  done < <(find "$HARNESS_MEM" -type f -print0)

  mv "$HARNESS_MEM" "$BAK"
  echo "Backed up old harness memory -> $BAK"
elif [ -L "$HARNESS_MEM" ]; then
  echo "Harness memory was a symlink to $(readlink "$HARNESS_MEM") — removing (no merge)."
  rm "$HARNESS_MEM"
fi

# --- link --------------------------------------------------------------------
ln -s "$REPO_MEM" "$HARNESS_MEM"

# --- report ------------------------------------------------------------------
echo
echo "Linked: $HARNESS_MEM -> $REPO_MEM"
echo "Merge summary: added=$added  skipped(identical)=$skipped  index_merged=$index_merged  conflicts=${#conflicts[@]}"
if [ "${#conflicts[@]}" -gt 0 ]; then
  echo "Conflicts (repo kept, incoming saved for review):"
  for c in "${conflicts[@]}"; do echo "  - $c  ->  $c.incoming-$HOST-$TS"; done
fi
if [ "$index_merged" -eq 1 ]; then
  echo "MEMORY.md was auto-merged (line-union) — please eyeball ordering."
fi
echo
echo "Next: review changes, then commit in the repo:"
echo "  git -C \"$REPO_ROOT\" add \"$MEM_REL\" CLAUDE.md && git -C \"$REPO_ROOT\" commit -m 'Sync Claude memory'"
