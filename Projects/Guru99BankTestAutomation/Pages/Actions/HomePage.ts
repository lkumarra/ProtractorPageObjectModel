import { TestUtil } from '../../Utils/TestUtil';
import { HomePageElements } from '../Locators/HomePageLocators';
import { NewCostumerPage } from './NewCostumerPage';
import { EditCostumerPage } from './EditCostumerPage';
import { IHomePage } from '../../Interface/IHomePage';
import { LogUtils } from '../../LogManager/LogUtils';
let homePageElements: HomePageElements = HomePageElements.getInstance();
let testUtil: TestUtil = TestUtil.getInstance();
export class HomePage implements IHomePage {

    /**
	*Return the message of welcome message after user login successfully
	* @return
    */
    public async verifyWelcomeMessage(): Promise<string> {
        let text = await testUtil.getWebElementText(homePageElements.welcomeMessageLocator());
        LogUtils.debugMessage("Welcome message is"+text, HomePage.name);
        return text;
    }

    /**
     * Verify the user login successfully by verifying the manager id
     */
    public async verifyManagerId(): Promise<string> {
        let text=await testUtil.getWebElementText(homePageElements.managerIdLocator());
        LogUtils.debugMessage("Welcome message is"+text, HomePage.name);
        return text;
    }

    /**
	 * Click on new costumer link available on home page
	 * 
	 * @return Return the object of New Costumer page
	 */
    public async clickOnNewCostumerLink(): Promise<NewCostumerPage> {
        await testUtil.clickOnElement(homePageElements.newCostumerLinkLocator());
        LogUtils.debugMessage("Clicked on new customer link", HomePage.name);
        return new NewCostumerPage();
    }

    /**
	 * Click on edit costumer link available on home page
	 * 
	 * @return Return the object on Edit costumer page
	 */
    public async clickOnEditCostumerLink(): Promise<EditCostumerPage> {
        await testUtil.clickOnElement(homePageElements.editCostumerLinkLocator());
        LogUtils.debugMessage("Clicked on edit customer link", HomePage.name);
        return new EditCostumerPage();
    }
}