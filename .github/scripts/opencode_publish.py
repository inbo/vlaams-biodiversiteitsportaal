#!/usr/bin/env python3
"""Validate an opencode patch/branch before the trusted publisher pushes it.

Usage:
  opencode_publish.py <investigate|fix> [patch-file]

Reads the list of changed files from `git status --porcelain` (after the
patch was applied) and fails when a path outside the allowed prefixes is
present. Investigation stage is restricted to safe outputs only.

Allowed:
  investigate: test/cypress/, opencode-report.md
  fix: config/, branding/, docker/, test/cypress/, opencode-report.md
  (ponytail: single-repo v1; cross-repo PRs stay manual from the report.)
"""

import subprocess
import sys

ALLOWED = {
    "investigate": ("test/cypress/", "opencode-report.md"),
    "fix": ("config/", "branding/", "docker/", "test/cypress/", "opencode-report.md"),
}


def changed_files() -> list[str]:
    out = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    files = []
    for line in out.splitlines():
        parts = line.strip().split(maxsplit=1)
        if len(parts) == 2:
            files.append(parts[1].strip('"'))
    return files


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else "investigate"
    prefixes = ALLOWED.get(mode, ALLOWED["investigate"])
    bad = [f for f in changed_files() if not f.startswith(prefixes)]
    if bad:
        print(f"Blocked paths for stage '{mode}':", file=sys.stderr)
        for f in bad:
            print(f"  {f}", file=sys.stderr)
        return 1
    print(f"OK: all paths allowed for stage '{mode}'.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
