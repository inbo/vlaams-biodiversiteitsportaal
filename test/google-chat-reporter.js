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
class GoogleChatReporter {
    constructor(runner, options) {
        const stats = runner.stats;
        const outputFile = options.outputFile || 'test-results.json';
        console.log(`Writing test results to ${outputFile}`, options);

        let output = [];
        if(fs.existsSync(outputFile)) {
             output = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        }

        runner
            // .once(EVENT_RUN_BEGIN, () => {

            // })
            .on(EVENT_SUITE_BEGIN, (test) => {
                if (test.fullTitle()) {
                    fs.appendFileSync(outputFile, `<b>${test.fullTitle()}</b>\n\n`);
                output.push({
                    "textParagraph": {
                        "text": `<b>${test.fullTitle()}</b>`,
                    }
                });
                }
            })
            .on(EVENT_SUITE_END, () => {
            })
            .on(EVENT_TEST_PASS, (test) => {
                output.push({
                    "decoratedText": {
                        "text": `<font color=\"#008015\">${test.fullTitle()}</font>`,
                        "startIcon": {
                            "materialIcon": {
                                "name": "check_circle",
                                "fill": true,
                                "weight": 300,
                                "grade": -25
                            }
                        }
                    }
                });
            })
            .on(EVENT_TEST_FAIL, (test, err) => {
                output.push({
                    "decoratedText": {
                        "text": `<font color=\"#b10000\">${test.fullTitle()}</font>`,
                        "bottomLabel": err.message,
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
            })
            .on(EVENT_TEST_PENDING, (test) => {
                output.push({
                    "decoratedText": {
                        "text": `<font color=\"#cccccc\">${test.fullTitle()}</font>`,
                        "bottomLabel": "skipped",
                        "startIcon": {
                            "materialIcon": {
                                "name": "step_over",
                                "fill": true,
                                "weight": 200,
                                "grade": -25
                            }
                        }
                    }
                });
            })
            
            .once(EVENT_RUN_END, () => {
                output.push({
                    "textParagraph": {
                        "text": `<i>${stats.passes}/${stats.passes + stats.failures} ok</i>`,
                    }
                });
                fs.writeFileSync(outputFile, JSON.stringify(output));
            });
    }
}

module.exports = GoogleChatReporter;
