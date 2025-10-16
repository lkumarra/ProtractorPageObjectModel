/**
 * Export the mail information such as from to etc.
 */
export let params = {
  browserName: "chrome",
  sharedTestFiles: true,
  maxInstance: 4,
  nodeMailer: {
    sendMail: {
      fromUser: "lavendrarajput2001@gmail.com", // sender address
      toUser: "lavendra.rajputc1@outlook.com", // list of receivers
      subjectOfMail: "Guru99Bank TestReport", // Subject line
      textOfMail:
        "Hi,\n \nPFA Guru99Bank TestReport \nThanks\nNodeMailer",
    },
  },
};

/**
 * Export the test suite of spec files.
 */
export let suites = [
  "../TestCases/LoginPageTest.js",
  "../TestCases/HomePageTest.js",
  "../TestCases/NewCustomerPageTest.js",
  "../TestCases/EditCustomerPageTest.js",
  "../TestCases/DeleteCustomerPageTest.js",
];
