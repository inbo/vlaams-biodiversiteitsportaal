const Mocha = require("mocha");
const fs = require('node:fs');

const {
    EVENT_RUN_END,
    EVENT_TEST_FAIL,
    EVENT_TEST_PASS,
    EVENT_TEST_PENDING,
    EVENT_SUITE_BEGIN,
    EVENT_SUITE_END,
} = Mocha.Runner.constants;

// Cards are limited to 100 elements, so we limit the output to 90
const OUTPUT_LIMIT = 90;

// this reporter outputs test results, indenting two spaces per suite
class GoogleChatReporter {
    constructor(runner, options) {
        const outputFile = options.outputFile || 'test-results.json';
        console.log(`Writing test results to ${outputFile}`, options);

        let output = [];
        if (fs.existsSync(outputFile)) {
            output = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        }

        let suite;

        runner
            .on(EVENT_SUITE_BEGIN, (test) => {
                if (test.fullTitle()) {
                    suite = {
                        title: test.fullTitle(),
                        tests: []
                    };
                }
            })
            .on(EVENT_SUITE_END, () => {
                const passed = suite.tests.filter(t => t.result === 'passed').length;
                const failed = suite.tests.filter(t => t.result === 'failed').length;
                const pending = suite.tests.filter(t => t.result === 'skipped').length;

                output.push({
                    "textParagraph": {
                        "text": `<b>${suite.title}</b>\n<i>${passed} passed, ${failed} failed, ${pending} skipped</i>`
                    }
                });
                for (const test of suite.tests) {
                    if (test.result === 'failed') {
                        output.push({
                            "decoratedText": {
                                "text": `<font color=\"#b10000\">${test.title}</font>`,
                                "bottomLabel": test.err.message,
                                "startIcon": {
                                    "materialIcon": {
                                        "name": "cancel",
                                        "fill": true,
                                        "weight": 200,
                                        "grade": -25
                                    }
                                }
                            }
                        });
                    } else if (test.result === 'skipped') {
//                        output.push({
//                            "decoratedText": {
//                                "text": `<font color=\"#cccccc\">${test.title}</font>`,
//                                "bottomLabel": "skipped",
//                                "startIcon": {
//                                    "materialIcon": {
//                                        "name": "step_over",
//                                        "fill": true,
//                                        "weight": 200,
//                                        "grade": -25
//                                    }
//                                }
//                            }
//                        });
                    } else if (test.result === 'passed') {
//                        output.push({
//                            "decoratedText": {
//                                "text": `<font color=\"#00b100\">${test.title}</font>`,
//                                "bottomLabel": "passed",
//                                "startIcon": {
//                                    "materialIcon": {
//                                        "name": "check_circle",
//                                        "fill": true,
//                                        "weight": 200,
//                                        "grade": -25
//                                    }
//                                }
//                            }
//                        });
                    }
                }
            })
            .on(EVENT_TEST_PASS, (test) => {
                suite.tests.push({
                    title: test.fullTitle(),
                    result: 'passed'
                });
            })
            .on(EVENT_TEST_FAIL, (test, err) => {
                test.err = err;
                suite.tests.push({
                    title: test.fullTitle(),
                    result: 'failed',
                    err: {
                        message: err.message,
                    }

                });
            })
            .on(EVENT_TEST_PENDING, (test) => {
                suite.tests.push({
                    title: test.fullTitle(),
                    result: 'skipped',
                });
            })

            .once(EVENT_RUN_END, () => {
                if (output.length > OUTPUT_LIMIT) {
                    output.splice(OUTPUT_LIMIT);
                    output.push({
                        "textParagraph": {
                            "text": `...`
                        }
                    });
                }

                fs.writeFileSync(outputFile, JSON.stringify(output));
            });
    }
}

module.exports = GoogleChatReporter;
