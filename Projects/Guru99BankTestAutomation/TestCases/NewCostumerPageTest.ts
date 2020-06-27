//#region Module Imports
import { Page } from "../Pages/BasePage/Page";
import { NewCostumerData, DATA } from "../TestData/Data";
import { ILoginPage } from "../Interface/ILoginPage";
import { LoginPage } from "../Pages/Actions/LoginPage";
import { IHomePage } from "../Interface/IHomePage";
import { INewCostumerPage } from "../Interface/INewCostumerPage";
//#endregion

//#region  Fields
let inputData = NewCostumerData.costumerNameField.inputData;
let verificationData = NewCostumerData.costumerNameField.verificationMessage;
let loginPage: ILoginPage = new LoginPage();
let homePage: IHomePage;
let newCostumerPage: INewCostumerPage;
//#endregion

//#region TestWorkflow
describe("Guru99Bank NewCostumer Page Testcases workflow", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
    homePage = await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
    newCostumerPage = await homePage.clickOnNewCostumerLink();
  });

  it("Verify costumer name field  with invalid name numbers ", async () => {
    let message: string = await newCostumerPage.costumerNameInvalidCharacterVerify(
      inputData.number
    );
    expect(message).toBe(verificationData.numberMessage);
  });

  it("Verify costumer name field with invalid name invallid chracters ", async () => {
    let message: string = await newCostumerPage.costumerNameInvalidCharacterVerify(
      inputData.specialCharacter
    );
    expect(message).toBe(verificationData.specialCharacterMeaasge);
  });

  it("Verify costumer name filed with invalid name space", async () => {
    let message: string = await newCostumerPage.costumerNameInvalidCharacterVerify(
      inputData.whiteSpace
    );
    expect(message).toBe(verificationData.whiteSpaceMessage);
  });

  it("Verify the maximum characters limit in costumer name filed by enterig maximum characters", async () => {
    let length: string = await newCostumerPage.costumerNameFieldMaxCharacterLength(
      inputData.moreThanLength
    );
    expect(length).toBe(verificationData.length);
  });

  it("verify costumer name message without entering any value", async () => {
    let message: string = await newCostumerPage.constumerNameBlankVerify();
    expect(message).toBe(verificationData.blank);
  });
});
//#endregion
