//#region ModuleImports
import { LoginPage } from "../Pages/Actions/LoginPage";
import { ILoginPage } from "../Interface/ILoginPage";
import { Page } from "../Pages/BasePage/Page";
import { DATA, DeleteCustomerData } from "../TestData/Data";
import { IHomePage } from "../Interface/IHomePage";
import { IDeleteCustomerPage } from "../Interface/IDeleteCustomerPage";
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
