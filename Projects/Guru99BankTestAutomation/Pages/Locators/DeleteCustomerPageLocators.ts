import { findBy, How } from "../../exports/ExportUtils";
import { ElementFinder } from "protractor";

export class DeleteCustomerElements {
  private static _instance: DeleteCustomerElements = new DeleteCustomerElements();

  /**
   * Return the instance of DeleteCustomerElements page.
   */
  public static getInstance(): DeleteCustomerElements {
    return this._instance;
  }

  //#region  PageFactory

  @findBy(How.NAME, "cusid")
  private _customerId: ElementFinder;

  @findBy(How.NAME, "AccSubmit")
  private _submitButton: ElementFinder;

  @findBy(How.NAME, "res")
  private _resetButton: ElementFinder;

  @findBy(How.XPATH, "//label[contains(@id, 'message')]")
  private _deleteCustomerMessage: ElementFinder;

  //#endregion

  //#endregion GetterMethods.

  /**
   * Return the ElementFinder of CustomerId TextBox.
   * @returns ElementFinder of CustomerID TextBox.
   */
  public getCustomerIDLocator(): ElementFinder {
    return this._customerId;
  }

  /**
   * Return the ElementFinder of SubmitButton.
   * @returns ElementFinder of SubmitButton.
   */
  public getSubmitButtonLocator(): ElementFinder {
    return this._submitButton;
  }

  /**
   * Return the ElementFinder of ResetButton.
   * @returns ElementFinder of ResetButton.
   */
  public getResetButtonLocator(): ElementFinder {
    return this._resetButton;
  }

  /**
   * Return the ElementFinder of CustomerId Message.
   * @returns ElementFinder of CustomerID Message.
   */
  public getCustomerIdMessageLocator(): ElementFinder {
    return this._deleteCustomerMessage;
  }

  //#endregion
}
