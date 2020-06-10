import { by, Locator } from "protractor";
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

  /**
   * Element initialization
   */
  private userId: Locator = by.name("uid");
  private password: Locator = by.name("password");
  private loginButton: Locator = by.name("btnLogin");
  private resetButton: Locator = by.xpath("btnReset");

  /**
   * Return userid locator
   */
  public userIdLocator(): Locator {
    return this.userId;
  }

  /**
   * Retrun password locator
   */
  public passwordLocator(): Locator {
    return this.password;
  }

  /**
   * Return login button locator
   */
  public loginButtonLocator(): Locator {
    return this.loginButton;
  }

  /**
   * Return reset button locator
   */
  public resetButtonLocator(): Locator {
    return this.resetButton;
  }
}
