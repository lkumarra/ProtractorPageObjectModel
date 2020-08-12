import { TestUtil, LogUtils } from "../../Exports/ExportUtils";
import { EditCostumerElements } from "../../Exports/ExportLocators";
import { IEditCostumerPage } from "../../Exports/ExportInterface";

export class EditCostumerPage implements IEditCostumerPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _editCostumerElemets: EditCostumerElements = EditCostumerElements.getInstance();
  className: string = EditCostumerPage.name;
  /**
   * Enter text on costumer id field on edit costumer page
   * @param costumerId
   */
  public async setCostumerId(costumerId: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._editCostumerElemets.getCostumerIDLocator(),
      costumerId
    );
    LogUtils.debugMessage(
      "CustomerId : " + costumerId + " is entered",
      this.className
    );
  }

  /**
   * Click on submit button on edit costumer page
   */
  public async clickOnSubmitButton() {
    await this._testUtil.clickOnElement(
      this._editCostumerElemets.getSubmitButtonLocator()
    );
    LogUtils.debugMessage("Clicked on submit button", this.className);
  }

  /**
   * Click on reset button on edit costumer page
   */
  public async clickOnResetButton() {
    await this._testUtil.clickOnElement(
      this._editCostumerElemets.getResetButtonLocator()
    );
    LogUtils.debugMessage("Clicked on Reset Button", this.className);
  }

  /**
   * Return the message of costumer id
   */
  public async getCostumerIDMessage(): Promise<string> {
    let mesaage: string = await this._testUtil.getWebElementText(
      this._editCostumerElemets.getCostumerIDMessageLocator()
    );
    LogUtils.debugMessage("CostumerId message is : " + mesaage, this.className);
    return mesaage;
  }

  /**
   * Verify the costumerid message by entering invalid characters in costumer id field
   * @param characters
   */
  public async verifyCostumerIdWithInvalidCharacters(
    characters: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "verifyCostumerIdWithInvalidCharacters is started",
      this.className
    );
    await this.setCostumerId(characters);
    let message: string = await this.getCostumerIDMessage();
    LogUtils.debugMessage(
      "verifyCostumerIdWithInvalidCharacters is completed",
      this.className
    );
    return message;
  }

  /**
   * Verify the alert text on by entering invalid characters in costumer id field
   * @param characters
   */
  public async verifyCostumerIDAlertMessage(
    characters: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "verifyCostumerIDAlertMessage is started",
      this.className
    );
    await this.setCostumerId(characters);
    await this.clickOnSubmitButton();
    let text: string = await this._testUtil.getAlertText();
    LogUtils.debugMessage("Alert text is : " + text, this.className);
    await this._testUtil.acceptAlert();
    LogUtils.debugMessage("Alert is accepted ", this.className);
    LogUtils.debugMessage(
      "verifyCostumerIDAlertMessage is completed",
      this.className
    );
    return text;
  }
}
