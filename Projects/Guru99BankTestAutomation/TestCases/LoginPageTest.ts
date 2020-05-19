import { LoginPage } from '../Pages/Actions/LoginPage';
import { TestBase } from '../TestBase/TestBase';
import { DATA } from '../TestData/Data';
let loginPage: LoginPage = new LoginPage();
describe('Guru99Bank login page test ', () => {

    beforeAll(async () => {
        await TestBase.initalization(DATA.URL);
    })

    it('Login to Guru99Bank application', async () => {
        await loginPage.login(DATA.USER_NAME, DATA.PASSWORD);
    })

})