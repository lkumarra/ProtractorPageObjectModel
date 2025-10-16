import { TestUtil, LogUtils } from "../../exports/utils";
import { HomePageElements } from "../../exports/locators";
import { IHomePage } from "../../exports//interfaces";
import {
  EditCustomerPage,
  NewCustomerPage,
  DeleteCustomerPage,
} from "../../exports/pages";
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
   * Click on new customer link available on home page
   * @returns Return the object of New Customer page
   */
  public async clickOnNewCustomerLink(): Promise<NewCustomerPage> {
    await this._testUtil.jsClick(
      this._homePageElements.getNewCustomerLinkLocator()
    );
    LogUtils.debugMessage("Clicked on NewCustomer Link ", this.className);
    return new NewCustomerPage();
  }

  /**
   * Click on edit customer link available on home page
   * @returns Return the object on Edit customer page
   */
  public async clickOnEditCustomerLink(): Promise<EditCustomerPage> {
    await this._testUtil.jsClick(
      this._homePageElements.getEditCustomerLinkLocator()
    );
    LogUtils.debugMessage("Clicked on EditCustomer Link ", this.className);
    return new EditCustomerPage();
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
