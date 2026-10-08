# OpenCode issue automation

Allowlisted comments trigger OpenCode sessions. Two stages: investigate
first (repro test only, no fix), then an approved fix.

## Usage

On any issue (not on PRs):

- `/opencode-investigate` — reproduce on dev, add one Cypress regression
  spec, push `opencode/issue-<N>/investigation-<comment-id>`, comment the
  report. Never implements the fix.
- `/opencode-fix <investigation-comment-id>` — continue from that
  investigation branch, fix minimal, push
  `opencode/issue-<N>/fix-<comment-id>`, open a draft PR.

Only the exact first line counts; other comments are ignored. One session
per issue at a time (`concurrency`), reruns reuse the same branch.

## Setup

Variables (`vars.`):

| Name                | Default                        | Notes                                              |
| ------------------- | ------------------------------ | -------------------------------------------------- |
| `OPENCODE_ALLOWLIST`| `StefanVanDyck,DimEvil`        | comma-separated logins, exact match                |
| `OPENCODE_IMAGE`    | `cypress/browsers:latest`      | prebuilt image with opencode+playwright when ready |
| `OPENCODE_MODEL`    | `github-copilot/gpt-5.1-codex`| `provider/model`; verify via `opencode models github-copilot` |

Secrets:

| Name                     | Notes                                              |
| ------------------------ | -------------------------------------------------- |
| `COPILOT_GITHUB_TOKEN`   | existing secret (already drives Copilot CLI); needs a Copilot subscription |
| `OPENCODE_API_KEY`       | optional fallback for non-Copilot models           |
| `CYPRESS_VBP_USERNAME` / `CYPRESS_VBP_PASSWORD` | dev test account (existing e2e secrets) |

## Copilot terms & billing

- Using Copilot models through OpenCode is explicitly supported by GitHub
  (Jan 2026 partnership). The current Generative AI Services Terms contain
  no third-party-client ban and expressly contemplate building agents on
  the services (§5B Shared Responsibility).
- Prefer a dedicated machine/bot account with its own Copilot seat for
  `COPILOT_GITHUB_TOKEN` — don't share a personal token. Some models need
  Pro+.
- Billing is usage-based: agentic runs burn premium requests fast. The
  per-issue concurrency and manual trigger already keep this thrifty.
- Prompts are retained for non-editor tools (§6 Data Handling) — same
  posture as the existing Copilot CLI job, no delta.

Target env is always `dev` (`CYPRESS_TARGET_ENV=dev`). Local and prod
repro is out of scope for the agent.

## Security model

- Agent container gets **no** `GITHUB_TOKEN`; it only leaves a patch +
  `opencode-report.md` as artifacts (`persist-credentials: false`).
- The trusted `publish` job validates paths
  (`.github/scripts/opencode_publish.py`), pushes the branch, comments,
  and opens the draft PR.
- Issue/comment text is untrusted: snapshotted to files via
  `github-script`, never interpolated into `run:` scripts.
- No Docker socket mount. Repo scoping relies on token permissions and
  branch policies (no hardcoded repo list, per deploy decision).

## Missing pieces (smallest useful scaffolding is in)

- Prebuilt image: default installs `opencode-ai@latest` on
  `cypress/browsers:latest` at runtime. Bake one to speed up + pin.
- Multi-repo PRs: fix opens one draft PR here; other repos stay manual
  from the report section. Needs a GitHub App to push elsewhere.
- `AWS_PROFILE=inbo-read-dev` log tail only works with read-only AWS
  creds in the runner; without them the agent notes the block and moves on.
