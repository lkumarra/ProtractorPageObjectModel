//#region ModuleImports
import { LoginPage } from "../Exports/ExportPages";
import { ILoginPage } from "../Exports/ExportInterface";
import { Page } from "../Pages/BasePage/Page";
import { DATA, LoginPageData } from "../TestData/Data";
//#endregion

//#region Fields
let loginPage: ILoginPage = new LoginPage();
//#endregion

//#region  TestWorkflow
describe("Guru99Bank LoginPage TestCases WorkFlow ", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
  });

  it("Verify userId label on login page is UserID", async () => {
    expect(await loginPage.getUserIdLabelText()).toBe(LoginPageData.userIdLabel);
  });

  it("Verify password label on login page is Password", async () => {
    expect(await loginPage.getPasswordLabelText()).toBe(
      LoginPageData.passwordLabel
    );
  });

  it("Verify alert text without entering UserId and Password is User or Password is not valid", async () => {
    expect(await loginPage.getAlertTextWithoutEnteringUserIdAndPassword()).toBe(
      LoginPageData.alertText
    );
  });

  it("Login to Guru99Bank application", async () => {
    await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
  });
});
//#endregion
