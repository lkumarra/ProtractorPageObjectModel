//#region ModuleImports
import { EditCustomerData, DATA } from "../test-data/testData";
import {
  ILoginPage,
  IHomePage,
  IEditCustomerPage,
} from "../exports/interfaces";
import { LoginPage } from "../exports/pages";
import { Page } from "../pages/base/Page";
//#endregion

//#region  Fields
let data: any = EditCustomerData.customerIDField;
let message: any = EditCustomerData.verification;
let loginPage: ILoginPage = new LoginPage();
let homePage: IHomePage;
let editCustomerPage: IEditCustomerPage;
//#endregion

//#region  TestWorkFlow
describe("Guru99Bank EditCustomer Page TestCases Workflow", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
    homePage = await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
    editCustomerPage = await homePage.clickOnEditCustomerLink();
  });

  it("verify edit customer id by entering alphabets", async () => {
    let text: string = await editCustomerPage.verifyCustomerIdWithInvalidCharacters(
      data.characters
    );
    expect(text).toBe(message.characters);
  });

  it("Verify edit customer id alert ", async () => {
    let text: string = await editCustomerPage.verifyCustomerIDAlertMessage(
      data.whiteSpace);
    expect(text).toBe(message.alertMessage);
  });

  it("Verify customer id field by entering special characters", async () => {
    let text: string = await editCustomerPage.verifyCustomerIdWithInvalidCharacters(
      data.specialCharacters
    );
    expect(text).toBe(message.specialCharacters);
  });

  it("Verify customer id field by entering space", async () => {
    let text: string = await editCustomerPage.verifyCustomerIdWithInvalidCharacters(
      data.whiteSpace
    );
    expect(text).toBe(message.whiteSpace);
  });
});
//#endregion
