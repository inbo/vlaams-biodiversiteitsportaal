const Mocha = require("mocha");
const fs = require('node:fs');

const {
    EVENT_RUN_BEGIN,
    EVENT_RUN_END,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
} = Mocha.Runner.constants;

// this reporter outputs test results, indenting two spaces per suite
class GoogleChatMarkdownReporter {
    constructor(runner, options) {
        this._indents = 1;
        const stats = runner.stats;
        const outputFile = options.outputFile || 'test-results.md';
        console.log(`Writing test results to ${outputFile}`, options);

        runner
            // .once(EVENT_RUN_BEGIN, () => {
                
            // })
            .on(EVENT_SUITE_BEGIN, (test) => {
                if (test.fullTitle()) {
                    fs.appendFileSync(outputFile, `${this.indent()} ${test.fullTitle()}\n\n`);                    
                }
                this.increaseIndent();
            })
            .on(EVENT_SUITE_END, () => {
                this.decreaseIndent();
                fs.appendFileSync(outputFile, `\n`);     
            })
            .on(EVENT_TEST_PASS, (test) => {
                // Test#fullTitle() returns the suite name(s)
                // prepended to the test title
                fs.appendFileSync(outputFile, `* :tick: ${test.fullTitle()}\n`);
            })
            .on(EVENT_TEST_FAIL, (test, err) => {
                fs.appendFileSync(outputFile, `* :cross-mark: ${test.fullTitle()}: ${err.message}\n`);
            })
            .once(EVENT_RUN_END, () => {
                fs.appendFileSync(outputFile, 
                    `Summary: ${stats.passes}/${stats.passes + stats.failures} ok\n\n`,
                );
            });
    }

    indent() {
        return Array(this._indents).join("#");
    }

    increaseIndent() {
        this._indents++;
    }

    decreaseIndent() {
        this._indents--;
    }
}

module.exports = GoogleChatMarkdownReporter;
