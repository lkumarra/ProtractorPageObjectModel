import { TestUtil } from "../../Utils/TestUtil";
import { EditCostumerElements } from "../Locators/EditCostumerPageLocators";
import { IEditCostumerPage } from "../../Interface/IEditCostumerPage";

export class EditCostumerPage implements IEditCostumerPage {
  private _testUtil: TestUtil = TestUtil.getInstance();
  private _editCostumerElemets: EditCostumerElements = EditCostumerElements.getInstance();
  /**
   * Enter text on costumer id field on edit costumer page
   * @param costumerId
   */
  public async setCostumerId(costumerId: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._editCostumerElemets.getCostumerIDLocator(),
      costumerId
    );
  }

  /**
   * Click on submit button on edit costumer page
   */
  public async clickOnSubmitButton() {
    await this._testUtil.clickOnElement(this._editCostumerElemets.getSubmitButtonLocator());
  }

  /**
   * Click on reset button on edit costumer page
   */
  public async clickOnResetButton() {
    await this._testUtil.clickOnElement(this._editCostumerElemets.getResetButtonLocator());
  }

  /**
   * Return the message of costumer id
   */
  public async getCostumerIDMessage(): Promise<string> {
    return this._testUtil.getWebElementText(
      this._editCostumerElemets.getCostumerIDMessageLocator()
    );
  }

  /**
   * Verify the costumerid message by entering invalid characters in costumer id field
   * @param characters
   */
  public async verifyCostumerIdWithInvalidCharacters(
    characters: string
  ): Promise<string> {
    await this.setCostumerId(characters);
    return this.getCostumerIDMessage();
  }

  /**
   * Verify the alert text on by entering invalid characters in costumer id field
   * @param characters
   */
  public async verifyCostumerIDAlertMessage(
    characters: string
  ): Promise<string> {
    await this.setCostumerId(characters);
    await this.clickOnSubmitButton();
    let text: string = await this._testUtil.getAlertText();
    await this._testUtil.acceptAlert();
    return text;
  }
}
