//#region ModuleImports
import { EditCostumerData, DATA } from "../TestData/Data";
import {
  ILoginPage,
  IHomePage,
  IEditCostumerPage,
} from "../Exports/ExportInterface";
import { LoginPage } from "../Exports/ExportPages";
import { Page } from "../Pages/BasePage/Page";
//#endregion

//#region  Fields
let data: any = EditCostumerData.costumerIDField;
let message: any = EditCostumerData.verification;
let loginPage: ILoginPage = new LoginPage();
let homePage: IHomePage;
let editCostumerPage: IEditCostumerPage;
//#endregion

//#region  TestWorkFlow
describe("Guru99Bank EditCostumer Page TestCases Workflow", () => {
  beforeAll(async () => {
    await Page.initalization(DATA.URL);
    homePage = await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
    editCostumerPage = await homePage.clickOnEditCostumerLink();
  });

  it("verify edit costumer id by entering alphabets", async () => {
    let text: string = await editCostumerPage.verifyCostumerIdWithInvalidCharacters(
      data.characters
    );
    expect(text).toBe(message.characters);
  });

  it("Verify edit costumer id alert ", async () => {
    let text: string = await editCostumerPage.verifyCostumerIDAlertMessage(
      data.characters
    );
    expect(text).toBe(message.alertMessage);
  });

  it("Verify costumer id field by entering special characters", async () => {
    let text: string = await editCostumerPage.verifyCostumerIdWithInvalidCharacters(
      data.specialCharacters
    );
    expect(text).toBe(message.specialCharacters);
  });

  it("Verify costumer id field by entering space", async () => {
    let text: string = await editCostumerPage.verifyCostumerIdWithInvalidCharacters(
      data.whiteSpace
    );
    expect(text).toBe(message.whiteSpace);
  });
});
//#endregion
