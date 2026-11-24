import { test as base, expect } from "@playwright/test";
import { ensureFreshLogin } from "./auth";
import { AUTH_FILE } from "./env";

export { expect };

export const test = base.extend<{ failOnPageError: void; authenticated: boolean }>({
  /** Start the test logged in as the default user */
  authenticated: [false, { option: true }],

  storageState: async ({ authenticated, storageState }, use) => {
    if (!authenticated) {
      await use(storageState);
      return;
    }
    ensureFreshLogin();
    await use(AUTH_FILE);
  },

  /**
   * Every test fails when the page throws an uncaught exception or an
   * unhandled promise rejection, like Cypress did by default.
   */
  failOnPageError: [
    async ({ page }, use, testInfo) => {
      const errors: Error[] = [];
      page.on("pageerror", (error) => {
        errors.push(error);
      });

      await use();

      if (errors.length > 0) {
        await testInfo.attach("page-errors", {
          body: errors.map((e) => e.stack ?? e.message).join("\n\n"),
          contentType: "text/plain",
        });
      }
      expect(
        errors.map((e) => e.message),
        "Uncaught exceptions on the page",
      ).toEqual([]);
    },
    { auto: true },
  ],
});
