import { TestBase } from "../TestBase/TestBase";
import { DATA, HomePageData } from "../TestData/Data";
import { LoginPage } from "../Pages/Actions/LoginPage";
import { IHomePage } from "../Interface/IHomePage";
import { ILoginPage } from "../Interface/ILoginPage";
let loginPage: ILoginPage = new LoginPage();
let homePage: IHomePage;
describe("Guru99Bank Home Page Test Cases Workflow", () => {
  beforeAll(async () => {
    await TestBase.initalization(DATA.URL);
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
