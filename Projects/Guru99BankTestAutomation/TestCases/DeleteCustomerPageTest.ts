//#region ModuleImports
import { LoginPage } from "../Exports/ExportPages";
import {
  ILoginPage,
  IHomePage,
  IDeleteCustomerPage,
} from "../Exports/ExportInterface";
import { Page } from "../Pages/BasePage/Page";
import { DATA, DeleteCustomerData } from "../TestData/Data";
//#endregion

//#region Fields
let loginPage: ILoginPage = new LoginPage();
let homePage: IHomePage;
let deleteCustomerPage: IDeleteCustomerPage;
let data = DeleteCustomerData.customerIDField;
let message = DeleteCustomerData.expectedMessage;
//#endregion

//#region TestWorkflow
describe("Guru99Bank DeleteCustomer Page TestCases WorkFlow ", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
    homePage = await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
    deleteCustomerPage = await homePage.clickOnDeleteCustomerLink();
  });

  it("Verify CustomerId Message By entering aphlabets", async () => {
    expect(await deleteCustomerPage.getCustomerIdMessage(data.characters)).toBe(
      message.characters
    );
  });

  it("Verify CustomerId Message By entering specialcharacters", async () => {
    expect(
      await deleteCustomerPage.getCustomerIdMessage(data.specialCharacters)
    ).toBe(message.specialCharacters);
  });
});
//#endregion
