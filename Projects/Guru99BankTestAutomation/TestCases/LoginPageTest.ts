import { LoginPage } from "../Pages/Actions/LoginPage";
import { ILoginPage } from "../Interface/ILoginPage";
import { Page } from "../Pages/BasePage/Page";
import { DATA } from "../TestData/Data";

let loginPage: ILoginPage = new LoginPage();

describe("Guru99Bank login page test ", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
  });

  it("Login to Guru99Bank application", async () => {
    await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
  });
});
