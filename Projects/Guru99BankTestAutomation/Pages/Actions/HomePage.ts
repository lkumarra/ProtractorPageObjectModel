import { TestUtil } from "../../Utils/TestUtil";
import { HomePageElements } from "../Locators/HomePageLocators";
import { IHomePage } from "../../Interface/IHomePage";
import { LogUtils } from "../../LogManager/LogUtils";
import { EditCostumerPage } from "./EditCostumerPage";
import { NewCostumerPage } from "./NewCostumerPage";
import { DeleteCustomerPage } from "./DeleteCustomerPage";

let homePageElements: HomePageElements = HomePageElements.getInstance();
let testUtil: TestUtil = TestUtil.getInstance();

export class HomePage implements IHomePage {
  className: string = HomePage.name;

  /**
   *Return the message of welcome message after user login successfully
   * @return
   */
  public async verifyWelcomeMessage(): Promise<string> {
    let text = await testUtil.getWebElementText(
      homePageElements.getWelcomeMessageLocator()
    );
    LogUtils.debugMessage("Welcome message is : " + text, HomePage.name);
    return text;
  }

  /**
   * Verify the user login successfully by verifying the manager id
   */
  public async verifyManagerId(): Promise<string> {
    let text = await testUtil.getWebElementText(
      homePageElements.getManagerIdLocator()
    );
    LogUtils.debugMessage("Manager ID is : " + text, this.className);
    return text;
  }

  /**
   * Click on new costumer link available on home page
   * @returns Return the object of New Costumer page
   */
  public async clickOnNewCostumerLink(): Promise<NewCostumerPage> {
    await testUtil.clickOnElement(homePageElements.getNewCostumerLinkLocator());
    LogUtils.debugMessage("Clicked on NewCustomer Link ", this.className);
    return new NewCostumerPage();
  }

  /**
   * Click on edit costumer link available on home page
   * @returns Return the object on Edit costumer page
   */
  public async clickOnEditCostumerLink(): Promise<EditCostumerPage> {
    await testUtil.clickOnElement(
      homePageElements.getEditCostumerLinkLocator()
    );
    LogUtils.debugMessage("Clicked on EditCustomer Link ", this.className);
    return new EditCostumerPage();
  }

  /**
   *Click On DeleteCustomer Link.
   */
  public async clickOnDeleteCustomerLink(): Promise<DeleteCustomerPage> {
    await testUtil.clickOnElement(
      homePageElements.getDeleteCustomerLinkLocator()
    );
    LogUtils.debugMessage("Clicked on Delete Customer Link", this.className);
    return new DeleteCustomerPage();
  }
}
