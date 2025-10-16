import { Config, browser } from "protractor";
import * as chromedriver from "chromedriver";
import { params, suites } from "../Suites/Suites";
import * as nodemailer from "nodemailer";
import moveFile from "move-file";
import { LogUtils } from '../LogManager/LogUtils';
let HtmlReporter = require("protractor-beautiful-reporter");
let jasmineReporters = require("jasmine-reporters");
let exec = require("child_process");
let locateChrome = require("locate-chrome");
var fs = require("fs");
let AllureReporter = require("jasmine-allure-reporter");
let colors = require("colors");
let displayProcessor = require("jasmine-spec-reporter").DisplayProcessor;
let globals = require("protractor");
let totalDateString: string;
let jsonsFolderName: string = "jsons";
let screenshotsFolderName: string = "screenshots";
let reportName: string = "Guru99Bank";
let hideSkippedTest: any;
let reportDirectory: string =
  process.cwd() + "/Projects/Guru99BankTestAutomation/TestReports/";
let reportFolder: string = "Guru99BankTestReports";
let reportPath: string = reportDirectory + reportFolder;
let oldReportPath: string =
  process.cwd() + "/Projects/Guru99BankTestAutomation/OldTestReports";
let reportURl: string =
  reportDirectory + reportFolder + "/" + reportName + ".html";
let pdfReport: string =
  reportDirectory + reportFolder + "/" + reportName + ".pdf";
let convert = (input) => {
  let output;
  if (input < 10) {
    output = "0" + input;
  } else {
    output = input;
  }
  return output;
};
function TimeProcessor(configuration) {}

function getTime() {
  let now = new Date();
  return (
    convert(now.getHours()) +
    ":" +
    convert(now.getMinutes()) +
    ":" +
    convert(now.getSeconds())
  );
}

TimeProcessor.prototype = new displayProcessor();

TimeProcessor.prototype.displaySuite = (suite, log) => {
  return getTime() + " - " + log;
};

TimeProcessor.prototype.displaySuccessfulSpec = (spec, log) => {
  return getTime() + " - " + log;
};

TimeProcessor.prototype.displayFailedSpec = (spec, log) => {
  return getTime() + " - " + log;
};

TimeProcessor.prototype.displayPendingSpec = (spec, log) => {
  return getTime() + " - " + log;
};

export let config: Config = {
  SELENIUM_PROMISE_MANAGER: false,
  suites: suites,
  useAllAngular2AppRoots: true,
  framework: "jasmine2",
  directConnect: true,
  chromeDriver: chromedriver.path,
  capabilities: {
    browserName: params.browserName,
    chromeOptions: {
      binary: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: [
        "--headless",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--window-size=1920,1080"
      ]
    }
  },
  // multiCapabilities: [{
  //     "browserName": "chrome"
  // },
  // {
  //     "browserName":"firefox"
  // }],
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 600000 * 3,
    print: () => {}, // print jasmine result (suppress protractor's default "dot" reporter)
  },
  onPrepare: async () => {
    let browser = globals.browser;
    let currentDate: Date = new Date();
    let specReporter: any;
    let infoToLog: any;
    let reporter: any;
    // Create Date and Time string
    totalDateString =
      currentDate.getFullYear() +
      "-" +
      convert(currentDate.getMonth() + 1) +
      "-" +
      convert(currentDate.getDate()) +
      "_" +
      convert(currentDate.getHours()) +
      "-" +
      convert(currentDate.getMinutes());
    //Move the old reportd to old reports folder.
    try{
    await moveFile(
      reportPath,
      oldReportPath + "/" + reportFolder + "_" + totalDateString
    );
    }catch(e){
      console.log("File is not present in directory so move operation can not performed")
    }
    process.setMaxListeners(100);
    console.log("The file has been moved");
    browser.manage().window().maximize();
    browser.manage().timeouts().implicitlyWait(10000);
    // Console reports
    specReporter = require("jasmine-spec-reporter").SpecReporter;
    reporter = new specReporter({
      customProcessors: [TimeProcessor],
      colors: { enabled: true },
      spec: { displayDuration: true },
      summary: { displayStacktrace: true },
    });
    infoToLog = {
      suiteStarted: (result) => {
        console.log(
          "\n  " +
            colors.bgBlue(' Running test: "' + result.description + '" ') +
            "\n"
        );
        LogUtils.debugMessage(' Running IT: "' + result.description + '" ', result.description);
      },
      specStarted: (result) => {
        console.log(
          "\n    " +
            colors.bgCyan(' Running IT: "' + result.description + '" ') +
            "\n"
        );
        LogUtils.debugMessage(' Running IT: "' + result.description + '" ', result.description)
      },
    };
    jasmine.getEnv().clearReporters();
    jasmine.getEnv().addReporter(infoToLog);
    jasmine.getEnv().addReporter(reporter);
    //protractor-beautiful-reporter config
    jasmine.getEnv().addReporter(
      new HtmlReporter({
        docName: reportName + ".html",
        docTitle: "Guru99BankTestAutomation",
        baseDirectory: reportPath,
        jsonsSubfolder: jsonsFolderName,
        takeScreenShotsOnlyForFailedSpecs: true,
        excludeSkippedSpecs: hideSkippedTest,
        screenshotsSubfolder: screenshotsFolderName,
        clientDefaults: {
          showTotalDurationIn: "header",
          totalDurationFormat: "hms",
        },
        columnSettings: {
          displayTime: true,
          displayBrowser: false,
          displaySessionId: false,
          displayOS: false,
          inlineScreenshots: false,
          warningTime: 10000,
          dangerTime: 20000,
        },
      }).getJasmine2Reporter()
    );
    var junitReporter = new jasmineReporters.JUnitXmlReporter({
      // setup the output path for the junit reports
      savePath: reportPath,

      // conslidate all true:
      //   output/junitresults.xml
      //
      // conslidate all set to false:
      //   output/junitresults-example1.xml
      //   output/junitresults-example2.xml
      consolidateAll: true,
    });
    jasmine.getEnv().addReporter(junitReporter);
    jasmine.getEnv().addReporter(
      new AllureReporter({
        resultsDir: "allure-results",
      })
    );
  },
  onComplete: async () => {
    locateChrome((where) => {
      // Print pdf report from html report
      console.log("Converting html report to pdf file");
      let command =
        '"' +
        where +
        '"' +
        " --headless --disable-gpu --print-to-pdf=" +
        reportPath +
        "/" +
        reportName +
        ".pdf --no-margins " +
        reportURl
      exec.execSync(command);
      console.log("Report Converted to pdf successfully")
    });
    // ...

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
      // Generate test SMTP service account from ethereal.email
      // Only needed if you don't have a real mail account for testing
      let testAccount = await nodemailer.createTestAccount();
      // create reusable transporter object using the default SMTP transport
      let transporter = await nodemailer.createTransport({
        service: "Gmail",
        port: 465,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env["email"].toString(), // generated ethereal user
          pass: process.env["password"].toString(), // generated ethereal password
        },
      });
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: params.nodeMailer.sendMail.fromUser, // sender address
        to: params.nodeMailer.sendMail.toUser, // list of receivers
        subject: params.nodeMailer.sendMail.subjectOfMail, // Subject line
        text: params.nodeMailer.sendMail.textOfMail, // plain text body
        priority: "high",
        attachments: [
          {
            path: pdfReport,
          },
        ],
      });

      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    await main().catch(console.error);
  },
};
