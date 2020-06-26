import { ElementFinder } from "protractor";
import { findBy } from "../../Utils/PageFactory";

let homePageElements: HomePageElements;

export class HomePageElements {
  /**
   * Return the instance of HomePage
   */
  public static getInstance(): HomePageElements {
    if (homePageElements == null) {
      homePageElements = new HomePageElements();
    }
    return homePageElements;
  }

  //#region  PageFactory

  @findBy("Xpath", "//marquee[@class = 'heading3']")
  private welcomeMessage: ElementFinder;

  @findBy("Css", "tr.heading3>td:first-child")
  private managerId: ElementFinder;

  @findBy("LinkText", "New Customer")
  private newCostumerLink: ElementFinder;

  @findBy("LinkText", "Edit Customer")
  private editCostumerLink: ElementFinder;

  //#endregion

  //#region  GetterMethods

  /**
   * Retrun welcome message login;
   */
  public getWelcomeMessageLocator(): ElementFinder {
    return this.welcomeMessage;
  }

  /**
   * Return managerId locator
   */
  public getManagerIdLocator(): ElementFinder {
    return this.managerId;
  }

  /**
   * Return new costume link locator
   */
  public getNewCostumerLinkLocator(): ElementFinder {
    return this.newCostumerLink;
  }

  /**
   * Return edit costumer link locator
   */
  public getEditCostumerLinkLocator(): ElementFinder {
    return this.editCostumerLink;
  }

  //#endregion
}
