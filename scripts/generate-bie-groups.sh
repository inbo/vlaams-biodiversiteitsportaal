#!/usr/bin/env bash
# Generates config/bie-index/groups.json from the single source config/common/groups.json.
#
# config/common/groups.json (namematching-service format) is used directly by namematching-service and
# biocache-service. bie-index expects a different format ({speciesGroup, taxonRank, taxa: [{name, common}]}),
# so it is derived here. The optional "bieCommonNames" map provides the per-taxon labels bie-index uses as
# subgroup; taxa without one get the group name. "excluded" can't be expressed in the bie-index format.
#
# Usage: scripts/generate-bie-groups.sh          regenerate the file
#        scripts/generate-bie-groups.sh --check  fail if the committed file is out of date
set -euo pipefail

cd "$(dirname "$0")/.."
SOURCE=config/common/groups.json
TARGET=config/bie-index/groups.json

generate() {
  jq '[.[] | {
        speciesGroup: .name,
        taxonRank: (if .rank == "classs" then "class" else .rank end),
        taxa: [ .name as $group | (.bieCommonNames // {}) as $labels
                | .included[] | {name: ., common: ($labels[.] // $group)} ]
      }]' "$SOURCE"
}

if [ "${1:-}" = "--check" ]; then
  if ! diff -u "$TARGET" <(generate); then
    echo "$TARGET is out of date with $SOURCE, run scripts/generate-bie-groups.sh" >&2
    exit 1
  fi
  echo "$TARGET is up to date"
else
  generate > "$TARGET"
  echo "Generated $TARGET from $SOURCE"
fi
