# VBP end-to-end tests

Playwright tests that run against a deployed portal (`prod` by default).

```sh
bun install
bunx playwright install chromium

# All tests against prod
E2E_VBP_USERNAME=... E2E_VBP_PASSWORD=... bunx playwright test

# Run from this folder: the login helper uses paths relative to it
# One spec against dev, in the UI runner
E2E_TARGET_ENV=dev bunx playwright test e2e/3-bie/search.spec.ts --ui
```

| Variable                     | Purpose                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| `E2E_TARGET_ENV`             | `local`, `dev`, `uat` or `prod` (default), see `support/env.ts`  |
| `E2E_VBP_USERNAME`/`_PASSWORD` | Keycloak user for the authenticated tests                      |
| `E2E_ENABLE_MUTATION_TESTS`  | `true` to also run tests that create and delete species lists   |

- Tests that need a login opt in with `test.use({ authenticated: true })`. The
  login is stored in `.auth/user.json` and redone when it is older than 5
  minutes, because Keycloak's SSO session expires when idle. It runs in a
  separate Node process (`support/login-cli.ts`), so the password never ends
  up in a trace. `e2e/auth.setup.ts` logs in first, to fail early on bad
  credentials.
- The login/logout tests (`e2e/1-main-page/auth.spec.ts`) run last, as the
  teardown of the setup project: logging out ends the user's other sessions.
- Every test fails on an uncaught exception in the page (`support/fixtures.ts`).
- Map and chart screenshots are only compared on prod. The baselines in
  `snapshots/` (git LFS) must be generated in the CI container, so the fonts
  match:

  ```sh
  podman run --rm -it -v "$PWD":/work -w /work --env-file <(env | grep ^E2E_) \
    mcr.microsoft.com/playwright:v1.65.1-noble \
    sh -c "npm i -g bun && bun install && bunx playwright test --update-snapshots"
  ```
