import { ElementFinder } from "protractor";
import { findBy, How } from '../../Utils/PageFactory';

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
  @findBy(How.NAME, "uid")
  private userId: ElementFinder;

  @findBy(How.NAME, "password")
  private password: ElementFinder;

  @findBy(How.NAME, "btnLogin")
  private loginButton: ElementFinder;

  @findBy(How.NAME, "btnReset")
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
