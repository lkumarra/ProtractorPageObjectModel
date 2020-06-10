export let params = {
  browserName: "chrome",
  sharedTestFiles: true,
  maxInstance:4,
  nodeMailer: {
    auth: {
      userEmail: "lavendrarajput2001@gmail.com", // generated ethereal user
      password: "Lav123456@", // generated ethereal password
    },
    sendMail: {
      fromUser: "lavendrarajput2001@gmail.com", // sender address
      toUser: "lavendrarajput2001@gmail.com", // list of receivers
      subjectOfMail: "Guru99Bank Test Automation reports", // Subject line
      textOfMail:
        "Hi Lavendra\n \nPlease find the link  reports of test exection\n  http://localhost:8080/job/Protractor_Test_Automation \nThanks\nNodeMailer",
    },
  },
};
export let suites = [
  "../TestCases/LoginPageTest.js",
  "../TestCases/HomePageTest.js",
  "../TestCases/NewCostumerPageTest.js",
  "../TestCases/EditCostumerPageTest.js",
];
