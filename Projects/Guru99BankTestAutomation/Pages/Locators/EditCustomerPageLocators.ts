import { ElementFinder } from "protractor";
import { findBy, How } from "../../Exports/ExportUtils";

export class EditCustomerElements {
  private static _instance: EditCustomerElements = new EditCustomerElements();
  /**
   * Return the object of Edit customer elements
   */
  public static getInstance(): EditCustomerElements {
    return this._instance;
  }

  //#region  PageFactory

  @findBy(How.NAME, "cusid")
  private _customerID: ElementFinder;

  @findBy(How.NAME, "AccSubmit")
  private _submitButton: ElementFinder;

  @findBy(How.NAME, "res")
  private _resetButton: ElementFinder;

  @findBy(How.ID, "message14")
  private _customerIDMessage: ElementFinder;

  //#endregion

  //#region GetterMethods

  /**
   * Return customer id locator
   */
  public getCustomerIDLocator(): ElementFinder {
    return this._customerID;
  }

  /**
   * Return submit button locator
   */
  public getSubmitButtonLocator(): ElementFinder {
    return this._submitButton;
  }

  /**
   * Return reset button locator
   */
  public getResetButtonLocator(): ElementFinder {
    return this._resetButton;
  }

  /**
   * Return customer id message locator
   */
  public getCustomerIDMessageLocator(): ElementFinder {
    return this._customerIDMessage;
  }

  //#endregion
}
