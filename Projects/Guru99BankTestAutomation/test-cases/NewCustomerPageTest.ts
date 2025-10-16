//#region Module Imports
import { Page } from "../pages/base/Page";
import { NewCustomerData, DATA } from "../test-data/Data";
import {
  ILoginPage,
  IHomePage,
  INewCustomerPage,
} from "../exports/ExportInterface";
import { LoginPage } from "../exports/ExportPages";
//#endregion

//#region  Fields
let inputData = NewCustomerData.customerNameField.inputData;
let verificationData = NewCustomerData.customerNameField.verificationMessage;
let loginPage: ILoginPage = new LoginPage();
let homePage: IHomePage;
let newCustomerPage: INewCustomerPage;
//#endregion

//#region TestWorkflow
describe("Guru99Bank NewCustomer Page Testcases workflow", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
    homePage = await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
    newCustomerPage = await homePage.clickOnNewCustomerLink();
  });

  it("Verify customer name field  with invalid name numbers ", async () => {
    let message: string = await newCustomerPage.customerNameInvalidCharacterVerify(
      inputData.number
    );
    expect(message).toBe(verificationData.numberMessage);
  });

  it("Verify customer name field with invalid name invallid chracters ", async () => {
    let message: string = await newCustomerPage.customerNameInvalidCharacterVerify(
      inputData.specialCharacter
    );
    expect(message).toBe(verificationData.specialCharacterMeaasge);
  });

  it("Verify customer name filed with invalid name space", async () => {
    let message: string = await newCustomerPage.customerNameInvalidCharacterVerify(
      inputData.whiteSpace
    );
    expect(message).toBe(verificationData.whiteSpaceMessage);
  });

  it("Verify the maximum characters limit in customer name filed by enterig maximum characters", async () => {
    let length: string = await newCustomerPage.customerNameFieldMaxCharacterLength(
      inputData.moreThanLength
    );
    expect(length).toBe(verificationData.length);
  });

  it("verify customer name message without entering any value", async () => {
    let message: string = await newCustomerPage.constumerNameBlankVerify();
    expect(message).toBe(verificationData.blank);
  });
});
//#endregion
