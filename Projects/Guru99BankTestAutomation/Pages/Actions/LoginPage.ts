import { TestUtil } from "../../Utils/TestUtil";
import { LoginPageElements } from "../Locators/LoginPageLocators";
import { ILoginPage } from "../../Interface/ILoginPage";
import { HomePage } from "./HomePage";
import { LogUtils } from "../../LogManager/LogUtils";

let loginPageElements: LoginPageElements = LoginPageElements.getInstance();
let testUtil: TestUtil = TestUtil.getInstance();

export class LoginPage implements ILoginPage {
  className: string = LoginPage.name;

  /**
   * Set username on login page
   * @param userName
   */
  public async setUserName(userName: string) {
    await testUtil.enterTextIntoTextBox(
      loginPageElements.getUserIdLocator(),
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
    await testUtil.enterTextIntoTextBox(
      loginPageElements.getPasswordLocator(),
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
    await testUtil.clickOnElement(loginPageElements.getLoginButtonLocator());
    LogUtils.debugMessage("Clicked on Login Button", this.className);
  }

  /**
   * Click on reset button on login page
   */
  public async clickOnReset() {
    await testUtil.clickOnElement(loginPageElements.getResetButtonLocator());
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
