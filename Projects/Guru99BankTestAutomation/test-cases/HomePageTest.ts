//#region  ModuleImports
import { Page } from "../pages/base/Page";
import { ILoginPage, IHomePage } from "../exports/ExportInterface";
import { LoginPage } from "../exports/ExportPages";
import { DATA, HomePageData } from "../test-data/Data";
//#endregion

//#region Fields
let loginPage: ILoginPage = new LoginPage();
let homePage: IHomePage;
//#endregion

//#region TestWorkFlow
describe("Guru99Bank HomePage TestCases Workflow", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
    homePage = await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
  });

  it("Verify user should able to seen welcome message after login", async () => {
    expect(await homePage.verifyWelcomeMessage()).toBe(
      HomePageData.welcomeMessage
    );
  });

  it("Verify user should able to see the manager id from which he login", async () => {
    expect(await homePage.verifyManagerId()).toBe(HomePageData.managerId);
  });
});
//#endregion
