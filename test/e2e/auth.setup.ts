import { test as setup } from "../support/fixtures";
import { ensureFreshLogin } from "../support/auth";

// Fails the run early on invalid credentials. Tests that need a login opt in
// with `test.use({ authenticated: true })`, which refreshes it when it is old.
setup("Log in the default user", async () => {
  ensureFreshLogin({ force: true });
});
