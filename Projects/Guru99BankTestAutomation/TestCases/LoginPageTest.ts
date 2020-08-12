//#region ModuleImports
import { LoginPage } from "../Exports/ExportPages";
import { ILoginPage } from "../Exports/ExportInterface";
import { Page } from "../Pages/BasePage/Page";
import { DATA } from "../TestData/Data";
//#endregion

//#region Fields
let loginPage: ILoginPage = new LoginPage();
//#endregion

//#region  TestWorkflow
describe("Guru99Bank LoginPage TestCases WorkFlow ", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
  });

  it("Login to Guru99Bank application", async () => {
    await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
  });
});
//#endregion
