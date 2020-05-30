import { TestBase } from '../TestBase/TestBase';
import { DATA, EditCostumerData} from '../TestData/Data';
import { LoginPage } from '../Pages/Actions/LoginPage';
import { HomePage } from '../Pages/Actions/HomePage';
import { EditCostumerPage } from '../Pages/Actions/EditCostumerPage';
let data = EditCostumerData.costumerIDField;
let message = EditCostumerData.verification;
let loginPage: LoginPage = new LoginPage();
let homePage: HomePage;
let editCostumerPage: EditCostumerPage;
describe("Edit costumer page test workflow", () => {

    beforeAll(async () => {
        await TestBase.initalization(DATA.URL);
        homePage = await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
        editCostumerPage = await homePage.clickOnEditCostumerLink();
    });

    it("verify edit costumer id by entering alphabets", async () => {
        let text:string = await editCostumerPage.verifyCostumerIdWithInvalidCharacters(data.characters);
        expect(text).toBe(message.characters)
    });

    it("Verify edit costumer id alert ", async () => {
        let text:string = await editCostumerPage.verifyCostumerIDAlertMessage(data.characters);
        expect(text).toBe(message.alertMessage)
    });

    it("Verify costumer id field by entering special characters", async () => {
        let text:string = await editCostumerPage.verifyCostumerIdWithInvalidCharacters(data.specialCharacters);
        expect(text).toBe(message.specialCharacters);
    })

    it("Verify costumer id field by entering space", async () => {
        let text:string = await editCostumerPage.verifyCostumerIdWithInvalidCharacters(data.whiteSpace);
        expect(text).toBe(message.whiteSpace)
    })

})