import { TestUtil, LogUtils } from "../../exports/utils";
import { EditCustomerElements } from "../../exports/locators";
import { IEditCustomerPage } from "../../exports/interfaces";

export class EditCustomerPage implements IEditCustomerPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _editCustomerElemets: EditCustomerElements = EditCustomerElements.getInstance();
  className: string = EditCustomerPage.name;
  /**
   * Enter text on customer id field on edit customer page
   * @param customerId
   */
  public async setCustomerId(customerId: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._editCustomerElemets.getCustomerIDLocator(),
      customerId
    );
    LogUtils.debugMessage(
      "CustomerId : " + customerId + " is entered",
      this.className
    );
  }

  /**
   * Click on submit button on edit customer page
   */
  public async clickOnSubmitButton() {
    await this._testUtil.clickOnElement(
      this._editCustomerElemets.getSubmitButtonLocator()
    );
    LogUtils.debugMessage("Clicked on submit button", this.className);
  }

  /**
   * Click on reset button on edit customer page
   */
  public async clickOnResetButton() {
    await this._testUtil.clickOnElement(
      this._editCustomerElemets.getResetButtonLocator()
    );
    LogUtils.debugMessage("Clicked on Reset Button", this.className);
  }

  /**
   * Return the message of customer id
   */
  public async getCustomerIDMessage(): Promise<string> {
    let mesaage: string = await this._testUtil.getWebElementText(
      this._editCustomerElemets.getCustomerIDMessageLocator()
    );
    LogUtils.debugMessage("CustomerId message is : " + mesaage, this.className);
    return mesaage;
  }

  /**
   * Verify the customerid message by entering invalid characters in customer id field
   * @param characters
   */
  public async verifyCustomerIdWithInvalidCharacters(
    characters: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "verifyCustomerIdWithInvalidCharacters is started",
      this.className
    );
    await this.setCustomerId(characters);
    let message: string = await this.getCustomerIDMessage();
    LogUtils.debugMessage(
      "verifyCustomerIdWithInvalidCharacters is completed",
      this.className
    );
    return message;
  }

  /**
   * Verify the alert text on by entering invalid characters in customer id field
   * @param characters
   */
  public async verifyCustomerIDAlertMessage(
    characters: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "verifyCustomerIDAlertMessage is started",
      this.className
    );
    await this.setCustomerId(characters);
    await this.clickOnSubmitButton();
    let text: string = await this._testUtil.getAlertText();
    LogUtils.debugMessage("Alert text is : " + text, this.className);
    await this._testUtil.acceptAlert();
    LogUtils.debugMessage("Alert is accepted ", this.className);
    LogUtils.debugMessage(
      "verifyCustomerIDAlertMessage is completed",
      this.className
    );
    return text;
  }
}
