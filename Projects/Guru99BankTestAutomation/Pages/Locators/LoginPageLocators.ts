import { ElementFinder } from "protractor";
import { findBy } from "../../Utils/PageFactory";

let loginPageElements: LoginPageElements;

export class LoginPageElements {
  /**
   * Return the object of LoginPageElements
   */
  public static getInstance(): LoginPageElements {
    if (loginPageElements == null) {
      loginPageElements = new LoginPageElements();
    }
    return loginPageElements;
  }

  //#region PageFactory
  @findBy("Name", "uid")
  private userId: ElementFinder;

  @findBy("Name", "password")
  private password: ElementFinder;

  @findBy("Name", "btnLogin")
  private loginButton: ElementFinder;

  @findBy("Name", "btnReset")
  private resetButton: ElementFinder;

  //#endregion

  //#region  GetterMethods

  /**
   * Return userid locator
   */
  public getUserIdLocator(): ElementFinder {
    return this.userId;
  }

  /**
   * Retrun password locator
   */
  public getPasswordLocator(): ElementFinder {
    return this.password;
  }

  /**
   * Return login button locator
   */
  public getLoginButtonLocator(): ElementFinder {
    return this.loginButton;
  }

  /**
   * Return reset button locator
   */
  public getResetButtonLocator(): ElementFinder {
    return this.resetButton;
  }

  //#endregion
}
