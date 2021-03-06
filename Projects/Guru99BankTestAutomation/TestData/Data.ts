export const DATA = {
  URL: "http://www.demo.guru99.com/V4/index.php",
  USER_NAME: "mngr314196",
  PASSWORD: "UtUvYbu",
};
export let LoginPageData = {
  userIdLabel:"UserID",
  passwordLabel:"Password",
  alertText:"User or Password is not valid"
}
export let NewCostumerData = {
  costumerNameField: {
    inputData: {
      number: "123456",
      specialCharacter: "!@#$%^&*",
      whiteSpace: "       ",
      moreThanLength: "abcdefghijklmnopqrstuvwxyz",
    },
    verificationMessage: {
      numberMessage: "Numbers are not allowed",
      specialCharacterMeaasge: "Special characters are not allowed",
      whiteSpaceMessage: "First character can not have space",
      length: "25",
      blank: "Customer name must not be blank",
    },
  },
};
export let HomePageData = {
  welcomeMessage: "Welcome To Manager's Page of Guru99 Bank",
  managerId: "Manger Id : mngr302250",
};
export let EditCostumerData = {
  costumerIDField: {
    characters: "abcdef",
    specialCharacters: "!@#$%^&*()",
    whiteSpace: "    ",
  },
  verification: {
    characters: "Characters are not allowed",
    alertMessage: "Please fill all fields",
    specialCharacters: "Special characters are not allowed",
    whiteSpace: "First character can not have space",
  },
};
export let DeleteCustomerData = {
  customerIDField: {
    characters: "abcdef",
    specialCharacters: "!@#$$%^&",
  },
  expectedMessage: {
    characters: "Characters are not allowed",
    specialCharacters: "Special characters are not allowed",
  },
};
