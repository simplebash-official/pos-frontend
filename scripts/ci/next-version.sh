#!/usr/bin/env bash
# Compute the next release version for frontend from Conventional Commit messages
# since the last \`v*\` tag.
#
#   scripts/ci/next-version.sh              # CI mode: writes to \$GITHUB_OUTPUT
#   scripts/ci/next-version.sh --dry-run    # prints version or "none" to stdout
#
# Bump rules:
#   feat            -> minor
#   fix | perf      -> patch
#   <type>!  or  a "BREAKING CHANGE:" / "BREAKING-CHANGE:" body footer -> breaking
#   docs chore ci refactor test build style revert (and anything unmatched) -> ignored
#
# Pre-1.0 (MAJOR == 0): breaking changes bump MINOR, not MAJOR.
set -euo pipefail

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

CURRENT="$(node -p "require('./package.json').version")"
if [[ ! "$CURRENT" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "next-version: package.json version '$CURRENT' is not X.Y.Z" >&2
  exit 1
fi

BASELINE="$(git describe --tags --abbrev=0 --match 'v*' 2>/dev/null || true)"
if [[ -n "$BASELINE" ]]; then
  RANGE="${BASELINE}..HEAD"
else
  # If no tag exists yet, baseline is current version without prior un-tagged history
  RANGE=""
fi

bump="none"
rank() { case "$1" in breaking) echo 3;; minor) echo 2;; patch) echo 1;; *) echo 0;; esac; }
consider() { [[ "$(rank "$1")" -gt "$(rank "$bump")" ]] && bump="$1" || true; }

if [[ -n "$RANGE" ]]; then
  LOG="$(git log --no-merges --format='%s%x1f%b%x1e' "$RANGE" || true)"
  type_re='^([a-zA-Z]+)(\([^)]*\))?(!)?:'

  while IFS= read -r -d $'\x1e' record; do
    record="${record#"${record%%[![:space:]]*}"}"
    [[ -z "$record" ]] && continue
    subject="${record%%$'\x1f'*}"
    body="${record#*$'\x1f'}"

    if [[ "$body" == *"BREAKING CHANGE:"* || "$body" == *"BREAKING-CHANGE:"* ]]; then
      consider breaking
    fi
    if [[ "$subject" =~ $type_re ]]; then
      type="$(echo "${BASH_REMATCH[1]}" | tr '[:upper:]' '[:lower:]')"
      bang="${BASH_REMATCH[3]}"
      if [[ -n "$bang" ]]; then
        consider breaking
      else
        case "$type" in
          feat) consider minor ;;
          fix|perf) consider patch ;;
          *) : ;;
        esac
      fi
    fi
  done <<< "$LOG"
fi

IFS=. read -r MA MI PA <<< "$CURRENT"
next="$CURRENT"
case "$bump" in
  breaking)
    if [[ "$MA" -eq 0 && "${PRE_1_0_BREAKING:-minor}" != "major" ]]; then
      next="${MA}.$((MI + 1)).0"
    else
      next="$((MA + 1)).0.0"
    fi
    ;;
  minor) next="${MA}.$((MI + 1)).0" ;;
  patch) next="${MA}.${MI}.$((PA + 1))" ;;
esac

higher="$(printf '%s\n%s\n' "$CURRENT" "$next" | sort -t. -k1,1n -k2,2n -k3,3n | tail -1)"
[[ "$bump" != "none" ]] && next="$higher"

if [[ "$bump" == "none" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "none"
  else
    {
      echo "release=false"
      echo "version=$CURRENT"
      echo "tag=v$CURRENT"
      echo "bump=none"
    } >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT not set (run with --dry-run outside CI)}"
  fi
  exit 0
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "$next"
else
  {
    echo "release=true"
    echo "version=$next"
    echo "tag=v$next"
    echo "bump=$bump"
  } >> "${GITHUB_OUTPUT:?GITHUB_OUTPUT not set (run with --dry-run outside CI)}"
fi
