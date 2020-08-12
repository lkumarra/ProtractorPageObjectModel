import { TestUtil, LogUtils } from "../../Exports/ExportUtils";
import { LoginPageElements } from "../../Exports/ExportLocators";
import { ILoginPage } from "../../Exports/ExportInterface";
import { HomePage } from "../../Exports/ExportPages";

export class LoginPage implements ILoginPage {
  private _loginPageElements: LoginPageElements = LoginPageElements.getInstance();
  private _testUtil: TestUtil = TestUtil.getInstance();
  className: string = LoginPage.name;

  /**
   * Set username on login page
   * @param userName
   */
  public async setUserName(userName: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._loginPageElements.getUserIdLocator(),
      userName
    );
    LogUtils.debugMessage(
      "UserName : " + userName + " is entered",
      this.className
    );
  }

  /**
   * Set password on login page
   * @param password
   */
  public async setPassword(password: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._loginPageElements.getPasswordLocator(),
      password
    );
    LogUtils.debugMessage(
      "Password : " + password + " is entered",
      this.className
    );
  }

  /**
   * Click on login button on login page
   */
  public async clickOnLogin() {
    await this._testUtil.clickOnElement(
      this._loginPageElements.getLoginButtonLocator()
    );
    LogUtils.debugMessage("Clicked on Login Button", this.className);
  }

  /**
   * Click on reset button on login page
   */
  public async clickOnReset() {
    await this._testUtil.clickOnElement(
      this._loginPageElements.getResetButtonLocator()
    );
    LogUtils.debugMessage("Clicked on Reset Button", this.className);
  }
  /**
   * Enter the login credentials on login page
   * @param userName Username of the user
   * @param pasword Password of the user
   */
  public async login(userName: string, password: string): Promise<HomePage> {
    LogUtils.debugMessage("Login Started", this.className);
    await this.setUserName(userName);
    await this.setPassword(password);
    await this.clickOnLogin();
    LogUtils.debugMessage("Login Completed", this.className);
    return new HomePage();
  }
}
