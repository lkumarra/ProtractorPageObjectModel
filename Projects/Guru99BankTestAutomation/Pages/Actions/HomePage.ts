import { TestUtil, LogUtils } from "../../Exports/ExportUtils";
import { HomePageElements } from "../../Exports/ExportLocators";
import { IHomePage } from "../../Exports//ExportInterface";
import {
  EditCostumerPage,
  NewCostumerPage,
  DeleteCustomerPage,
} from "../../Exports/ExportPages";
export class HomePage implements IHomePage {
  private _homePageElements: HomePageElements = HomePageElements.getInstance();
  private _testUtil: TestUtil = TestUtil.getInstance();
  className: string = HomePage.name;

  /**
   *Return the message of welcome message after user login successfully
   * @return
   */
  public async verifyWelcomeMessage(): Promise<string> {
    let text = await this._testUtil.getWebElementText(
      this._homePageElements.getWelcomeMessageLocator()
    );
    LogUtils.debugMessage("Welcome message is : " + text, HomePage.name);
    return text;
  }

  /**
   * Verify the user login successfully by verifying the manager id
   */
  public async verifyManagerId(): Promise<string> {
    let text = await this._testUtil.getWebElementText(
      this._homePageElements.getManagerIdLocator()
    );
    LogUtils.debugMessage("Manager ID is : " + text, this.className);
    return text;
  }

  /**
   * Click on new costumer link available on home page
   * @returns Return the object of New Costumer page
   */
  public async clickOnNewCostumerLink(): Promise<NewCostumerPage> {
    await this._testUtil.jsClick(
      this._homePageElements.getNewCostumerLinkLocator()
    );
    LogUtils.debugMessage("Clicked on NewCustomer Link ", this.className);
    return new NewCostumerPage();
  }

  /**
   * Click on edit costumer link available on home page
   * @returns Return the object on Edit costumer page
   */
  public async clickOnEditCostumerLink(): Promise<EditCostumerPage> {
    await this._testUtil.jsClick(
      this._homePageElements.getEditCostumerLinkLocator()
    );
    LogUtils.debugMessage("Clicked on EditCustomer Link ", this.className);
    return new EditCostumerPage();
  }

  /**
   *Click On DeleteCustomer Link.
   */
  public async clickOnDeleteCustomerLink(): Promise<DeleteCustomerPage> {
    await this._testUtil.jsClick(
      this._homePageElements.getDeleteCustomerLinkLocator()
    );
    LogUtils.debugMessage("Clicked on Delete Customer Link", this.className);
    return new DeleteCustomerPage();
  }
}
