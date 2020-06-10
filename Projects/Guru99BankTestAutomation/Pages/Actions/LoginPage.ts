import { TestUtil } from "../../Utils/TestUtil";
import { LoginPageElements } from "../Locators/LoginPageLocators";
import { HomePage } from "./HomePage";
import { LogUtils } from "../../LogManager/LogUtils";
import { ILoginPage } from "../../Interface/ILoginPage";
let loginPageElements: LoginPageElements = LoginPageElements.getInstance();
let testUtil: TestUtil = TestUtil.getInstance();
export class LoginPage implements ILoginPage {
  /**
   * Set username on login page
   * @param userName
   */
  public async setUserName(userName: string) {
    await testUtil.enterTextIntoTextBox(
      loginPageElements.userIdLocator(),
      userName
    );
  }

  /**
   * Set password on login page
   * @param password
   */
  public async setPassword(password: string) {
    await testUtil.enterTextIntoTextBox(
      loginPageElements.passwordLocator(),
      password
    );
  }

  /**
   * Click on login button on login page
   */
  public async clickOnLogin() {
    await testUtil.clickOnElement(loginPageElements.loginButtonLocator());
  }

  /**
   * Click on reset button on login page
   */
  public async clickOnReset() {
    await testUtil.clickOnElement(loginPageElements.resetButtonLocator());
  }
  /**
   * Enter the login credentials on login page
   * @param userName Username of the user
   * @param pasword Password of the user
   */
  public async login(userName: string, password: string): Promise<HomePage> {
    LogUtils.debugMessage("Login started....", LoginPage.name);
    await this.setUserName(userName);
    LogUtils.debugMessage(
      "Username : " + userName + " is entered",
      LoginPage.name
    );
    await this.setPassword(password);
    LogUtils.debugMessage(
      "Password : " + password + " is entered",
      LoginPage.name
    );
    await this.clickOnLogin();
    LogUtils.debugMessage("Clicked on Login Button", LoginPage.name);
    return new HomePage();
  }
}
