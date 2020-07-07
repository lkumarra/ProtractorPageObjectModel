import { DeleteCustomerElements } from "../Locators/DeleteCustomerPageLocators";
import { TestUtil } from "../../Utils/TestUtil";
import { LogUtils } from "../../LogManager/LogUtils";
import { IDeleteCustomerPage } from "../../Interface/IDeleteCustomerPage";

export class DeleteCustomerPage implements IDeleteCustomerPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _deleteCustomerElements: DeleteCustomerElements = DeleteCustomerElements.getInstance();
  className: string = DeleteCustomerPage.name;

  /**
   * Enter CustomerId into CustomerId TextBox.
   * @param customerId Customer Id to enter.
   */
  public async setCustomerID(customerId: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._deleteCustomerElements.getCustomerIDLocator(),
      customerId
    );
    LogUtils.debugMessage(
      "CustomerId : " + customerId + " is entered ",
      this.className
    );
  }

  /**
   * Click on Submit Button.
   */
  public async clickOnSubmitButton() {
    await this._testUtil.clickOnElement(
      this._deleteCustomerElements.getSubmitButtonLocator()
    );
    LogUtils.debugMessage("Clicked on Submit Button", this.className);
  }

  /**
   * Click on Reset Button.
   */
  public async clickOnResetButton() {
    await this._testUtil.clickOnElement(
      this._deleteCustomerElements.getResetButtonLocator()
    );
    LogUtils.debugMessage("Clicked on Resest Button", this.className);
  }

  public async getCustomerIdMessage(customerId: string): Promise<String> {
    LogUtils.debugMessage("getCustomerIdMessage is stared", this.className);
    await this.setCustomerID(customerId);
    let message: string = await this._testUtil.getWebElementText(
      this._deleteCustomerElements.getCustomerIdMessageLocator()
    );
    LogUtils.debugMessage("CustomerId message is : " + message, this.className);
    return message;
  }
}
