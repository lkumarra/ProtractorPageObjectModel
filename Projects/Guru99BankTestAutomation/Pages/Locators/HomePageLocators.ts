import { ElementFinder } from "protractor";
import { findBy, How } from "../../exports/utils";

export class HomePageElements {
  private static _instance: HomePageElements = new HomePageElements();
  /**
   * Return the instance of HomePage
   */
  public static getInstance(): HomePageElements {
    return this._instance;
  }

  //#region  PageFactory

  @findBy(How.XPATH, "//marquee[@class = 'heading3']")
  private _welcomeMessage: ElementFinder;

  @findBy(How.CSS, "tr.heading3>td:first-child")
  private _managerId: ElementFinder;

  @findBy(How.LINKTEXT, "New Customer")
  private _newCustomerLink: ElementFinder;

  @findBy(How.LINKTEXT, "Edit Customer")
  private _editCustomerLink: ElementFinder;

  @findBy(How.LINKTEXT, "Delete Customer")
  private _deleteCustomerLink: ElementFinder;

  //#endregion

  //#region  GetterMethods

  /**
   * Retrun welcome message login;
   */
  public getWelcomeMessageLocator(): ElementFinder {
    return this._welcomeMessage;
  }

  /**
   * Return managerId locator.
   */
  public getManagerIdLocator(): ElementFinder {
    return this._managerId;
  }

  /**
   * Return new costume link locator.
   */
  public getNewCustomerLinkLocator(): ElementFinder {
    return this._newCustomerLink;
  }

  /**
   * Return edit customer link locator.
   */
  public getEditCustomerLinkLocator(): ElementFinder {
    return this._editCustomerLink;
  }

  /**
   * Return delete customer link locator.
   */
  public getDeleteCustomerLinkLocator(): ElementFinder {
    return this._deleteCustomerLink;
  }

  //#endregion
}
