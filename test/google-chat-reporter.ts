import * as fs from "node:fs";
import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
} from "@playwright/test/reporter";

// Google Chat cards are limited to 100 widgets, so we limit the output to 90
const OUTPUT_LIMIT = 90;

// Strip ANSI colour codes from Playwright's error messages
const stripAnsi = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "");

/**
 * Writes the Google Chat card widgets for the test run to `outputFile`. The
 * e2e workflow posts them to Google Chat when the run failed. Each describe
 * block gets a summary line, followed by its failed tests.
 */
export default class GoogleChatReporter implements Reporter {
  private outputFile: string;
  private rootSuite?: Suite;

  constructor(options: { outputFile?: string } = {}) {
    this.outputFile = options.outputFile ?? "test-results.json";
  }

  onBegin(_config: FullConfig, suite: Suite) {
    this.rootSuite = suite;
  }

  onEnd() {
    // Nothing ran, e.g. with --list
    if (!this.rootSuite || this.rootSuite.allTests().every((t) => t.results.length === 0)) {
      return;
    }

    // Group tests by their describe blocks, keeping the file order
    const groups = new Map<string, TestCase[]>();
    for (const test of this.rootSuite.allTests()) {
      // titlePath: ["", project, file, ...describes, title]
      const [, , file, ...rest] = test.titlePath();
      const describes = rest.slice(0, -1);
      const key = describes.length > 0 ? describes.join(" ") : file;
      groups.set(key, [...(groups.get(key) ?? []), test]);
    }

    const output: object[] = [];
    for (const [title, tests] of groups) {
      const outcomes = tests.map((t) => t.outcome());
      const passed = outcomes.filter((o) => o === "expected" || o === "flaky").length;
      const failed = outcomes.filter((o) => o === "unexpected").length;
      const skipped = outcomes.filter((o) => o === "skipped").length;

      output.push({
        textParagraph: {
          text: `<b>${title}</b>\n<i>${passed} passed, ${failed} failed, ${skipped} skipped</i>`,
        },
      });

      for (const test of tests.filter((t) => t.outcome() === "unexpected")) {
        const lastResult = test.results[test.results.length - 1];
        output.push({
          decoratedText: {
            text: `<font color="#b10000">${test.title}</font>`,
            bottomLabel: stripAnsi(lastResult?.error?.message ?? "").split("\n")[0],
            startIcon: {
              materialIcon: { name: "cancel", fill: true, weight: 200, grade: -25 },
            },
          },
        });
      }
    }

    if (output.length > OUTPUT_LIMIT) {
      output.splice(OUTPUT_LIMIT);
      output.push({ textParagraph: { text: "..." } });
    }

    fs.writeFileSync(this.outputFile, JSON.stringify(output));
  }

  printsToStdio() {
    return false;
  }
}
