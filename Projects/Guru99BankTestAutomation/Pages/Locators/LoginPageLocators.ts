import { ElementFinder } from "protractor";
import { findBy, How } from "../../Utils/PageFactory";

export class LoginPageElements {
  private static _instance: LoginPageElements = new LoginPageElements();
  /**
   * Return the object of LoginPageElements
   */
  public static getInstance(): LoginPageElements {
    return this._instance;
  }

  //#region PageFactory
  @findBy(How.NAME, "uid")
  private _userId: ElementFinder;

  @findBy(How.NAME, "password")
  private _password: ElementFinder;

  @findBy(How.NAME, "btnLogin")
  private _loginButton: ElementFinder;

  @findBy(How.NAME, "btnReset")
  private _resetButton: ElementFinder;

  //#endregion

  //#region  GetterMethods

  /**
   * Return userid locator
   */
  public getUserIdLocator(): ElementFinder {
    return this._userId;
  }

  /**
   * Retrun password locator
   */
  public getPasswordLocator(): ElementFinder {
    return this._password;
  }

  /**
   * Return login button locator
   */
  public getLoginButtonLocator(): ElementFinder {
    return this._loginButton;
  }

  /**
   * Return reset button locator
   */
  public getResetButtonLocator(): ElementFinder {
    return this._resetButton;
  }

  //#endregion
}
