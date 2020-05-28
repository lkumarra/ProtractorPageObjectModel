import { Config } from 'protractor';
import { suites, params } from '../Suites/Suites';
import * as nodemailer from 'nodemailer';
import * as moveFile from 'move-file';
let HtmlReporter = require('protractor-beautiful-reporter');
var jasmineReporters = require('jasmine-reporters');
var AllureReporter = require('jasmine-allure-reporter');
let colors = require('colors');
let displayProcessor = require('jasmine-spec-reporter').DisplayProcessor;
let globals = require('protractor');
let totalDateString:string;
let jsonsFolderName = 'jsons';
let screenshotsFolderName = 'screenshots';
let reportName = "Guru99Bank"
let hideSkippedTest: any;
let process = require("process")
let reportDirectory = process.cwd() + "/Projects/Guru99BankTestAutomation/TestReports/";
let reportFolder = "Guru99BankTestReports";
let reportPath = reportDirectory + reportFolder;
let oldReportPath = process.cwd() + "/Projects/Guru99BankTestAutomation/OldTestReports"
let convert = (input) => {
    let output;
    if (input < 10) {
        output = '0' + input;
    } else {
        output = input;
    }
    return output;
};
function TimeProcessor(configuration) {
}

function getTime() {
    let now = new Date();
    return convert(now.getHours()) + ':' + convert(now.getMinutes()) + ':' + convert(now.getSeconds());
}

TimeProcessor.prototype = new displayProcessor();

TimeProcessor.prototype.displaySuite = ((suite, log) => {
    return getTime() + ' - ' + log;
});

TimeProcessor.prototype.displaySuccessfulSpec = ((spec, log) => {
    return getTime() + ' - ' + log;
});

TimeProcessor.prototype.displayFailedSpec = ((spec, log) => {
    return getTime() + ' - ' + log;
});

TimeProcessor.prototype.displayPendingSpec = ((spec, log) => {
    return getTime() + ' - ' + log;
});

export let config: Config = {
    SELENIUM_PROMISE_MANAGER: false,
    // seleniumAddress: 'http://localhost:4444/wd/hub',
    suites: suites,
    useAllAngular2AppRoots: true,
    framework: 'jasmine2',
    capabilities: {
        'browserName': params.browserName,
    },
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 600000 * 3,
        print: () => {
        } // print jasmine result (suppress protractor's default "dot" reporter)
    },
    onPrepare: async () => {
        let browser = globals.browser;
        let currentDate: Date = new Date();
        let specReporter: any;
        let infoToLog: any;
        let reporter: any;
        // Create Date and Time string
        totalDateString = currentDate.getFullYear() + '-' + convert(currentDate.getMonth() + 1) + '-' +
            convert(currentDate.getDate()) + '_' + convert(currentDate.getHours()) + '-' +
            convert(currentDate.getMinutes());
        //Move the old reportd to old reports folder.
        await moveFile(reportPath, oldReportPath + "/" + reportFolder + "_" + totalDateString).catch();
        console.log('The file has been moved');
        browser.manage().window().maximize();
        browser.manage().timeouts().implicitlyWait(10000);
        // Console reports
        specReporter = require('jasmine-spec-reporter').SpecReporter;
        reporter = new specReporter({
            customProcessors: [TimeProcessor],
            colors: { enabled: true },
            spec: { displayDuration: true },
            summary: { displayStacktrace: true }
        });
        infoToLog = {
            suiteStarted: (result) => {
                console.log('\n  ' + colors.bgBlue(' Running test: "' + result.description + '" ') + '\n');
            },
            specStarted: (result) => {
                console.log('\n    ' + colors.bgCyan(' Running IT: "' + result.description + '" ') + '\n');
            }
        };
        jasmine.getEnv().clearReporters();
        jasmine.getEnv().addReporter(infoToLog);
        jasmine.getEnv().addReporter(reporter);
        //protractor-beautiful-reporter config
        jasmine.getEnv().addReporter(new HtmlReporter({
            docName: reportName + '.html',
            docTitle: "Guru99BankTestAutomation",
            baseDirectory: reportPath,
            jsonsSubfolder: jsonsFolderName,
            takeScreenShotsOnlyForFailedSpecs: true,
            excludeSkippedSpecs: hideSkippedTest,
            screenshotsSubfolder: screenshotsFolderName,
            clientDefaults: {
                showTotalDurationIn: "header",
                totalDurationFormat: "hms"
            },
            columnSettings: {
                displayTime: true,
                displayBrowser: false,
                displaySessionId: false,
                displayOS: false,
                inlineScreenshots: false,
                warningTime: 10000,
                dangerTime: 20000
            }

        }).getJasmine2Reporter());
        var junitReporter = new jasmineReporters.JUnitXmlReporter({

            // setup the output path for the junit reports
            savePath: reportPath,
      
            // conslidate all true:
            //   output/junitresults.xml
            //
            // conslidate all set to false:
            //   output/junitresults-example1.xml
            //   output/junitresults-example2.xml
            consolidateAll: true
      
          });
          jasmine.getEnv().addReporter(junitReporter);
          jasmine.getEnv().addReporter(new AllureReporter({
            resultsDir: 'allure-results'
          }));
    },
    onComplete: async () => {
        // async..await is not allowed in global scope, must use a wrapper
        async function main() {
            // Generate test SMTP service account from ethereal.email
            // Only needed if you don't have a real mail account for testing
            let testAccount = await nodemailer.createTestAccount();
            // create reusable transporter object using the default SMTP transport
            let transporter = await nodemailer.createTransport({
                service: "Gmail",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: params.nodeMailer.auth.userEmail, // generated ethereal user
                    pass: params.nodeMailer.auth.password// generated ethereal password
                }
            });
            // send mail with defined transport object
            let info = await transporter.sendMail({
                from: params.nodeMailer.sendMail.fromUser, // sender address
                to: params.nodeMailer.sendMail.toUser, // list of receivers
                subject: params.nodeMailer.sendMail.subjectOfMail, // Subject line
                text: params.nodeMailer.sendMail.textOfMail, // plain text body
                priority: "high",
            });

            console.log("Message sent: %s", info.messageId);
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

            // Preview only available when sending through an Ethereal account
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        }
        await main().catch(console.error);
    }
};
