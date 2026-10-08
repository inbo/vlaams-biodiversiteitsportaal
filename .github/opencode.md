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
| `OPENCODE_MODEL`    | (provider default)             | e.g. `anthropic/claude-sonnet-4-5`                 |

Secrets:

| Name                     | Notes                                              |
| ------------------------ | -------------------------------------------------- |
| `OPENCODE_API_KEY`       | provided at deploy; mapped to provider envs        |
| `CYPRESS_VBP_USERNAME` / `CYPRESS_VBP_PASSWORD` | dev test account (existing e2e secrets) |

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
