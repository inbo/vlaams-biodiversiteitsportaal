#!/usr/bin/env python3
"""Gate for /opencode-investigate and /opencode-fix commands.

Reads untrusted comment/issue data only from environment variables (never
from inline shell interpolation) and decides whether to run.

Env in:
  COMMENT_BODY, COMMENT_USER, ALLOWLIST (comma-separated logins),
  ISSUE_NUMBER, COMMENT_ID, IS_PR ("true" when the comment is on a PR).

Writes GITHUB_OUTPUT out:
  run, command (investigate|fix|none), investigation_id, issue_number,
  comment_id, branch, base_branch
"""

import os
import re
import sys

INVESTIGATE_RE = re.compile(r"^/opencode-investigate\b")
FIX_RE = re.compile(r"^/opencode-fix(?:\s+([A-Za-z0-9._/-]{1,64}))?\s*$")
# ponytail: strict allowlist match, no org/team expansion; add when needed.
SAFE_REF_RE = re.compile(r"^[A-Za-z0-9._/-]{1,64}$")


def main() -> int:
    body = os.environ.get("COMMENT_BODY", "")
    user = os.environ.get("COMMENT_USER", "")
    allowlist = os.environ.get("ALLOWLIST", "StefanVanDyck,DimEvil")
    issue_number = os.environ.get("ISSUE_NUMBER", "")
    comment_id = os.environ.get("COMMENT_ID", "")
    is_pr = os.environ.get("IS_PR", "false").lower() == "true"

    first_line = body.splitlines()[0].strip() if body.splitlines() else ""
    allowed = {u.strip() for u in allowlist.split(",") if u.strip()}

    command = "none"
    investigation_id = ""
    if not is_pr and user in allowed:
        if INVESTIGATE_RE.match(first_line):
            command = "investigate"
        else:
            m = FIX_RE.match(first_line)
            if m:
                command = "fix"
                investigation_id = m.group(1) or ""

    run = "true" if command in ("investigate", "fix") else "false"

    if command == "investigate":
        branch = f"opencode/issue-{issue_number}/investigation-{comment_id}"
        base_branch = ""
    elif command == "fix":
        branch = f"opencode/issue-{issue_number}/fix-{comment_id}"
        if investigation_id.isdigit():
            base_branch = (
                f"opencode/issue-{issue_number}/investigation-{investigation_id}"
            )
        elif investigation_id and SAFE_REF_RE.match(investigation_id):
            base_branch = investigation_id
        else:
            base_branch = ""
    else:
        branch = ""
        base_branch = ""

    out = os.environ.get("GITHUB_OUTPUT")
    lines = [
        f"run={run}",
        f"command={command}",
        f"investigation_id={investigation_id}",
        f"issue_number={issue_number}",
        f"comment_id={comment_id}",
        f"branch={branch}",
        f"base_branch={base_branch}",
    ]
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")
    else:
        print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
