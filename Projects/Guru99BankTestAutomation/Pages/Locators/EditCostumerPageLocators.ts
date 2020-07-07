import { ElementFinder } from "protractor";
import { findBy, How } from "../../Utils/PageFactory";

export class EditCostumerElements {
  private static _instance: EditCostumerElements = new EditCostumerElements();
  /**
   * Return the object of Edit costumer elements
   */
  public static getInstance(): EditCostumerElements {
    return this._instance;
  }

  //#region  PageFactory

  @findBy(How.NAME, "cusid")
  private _costumerID: ElementFinder;

  @findBy(How.NAME, "AccSubmit")
  private _submitButton: ElementFinder;

  @findBy(How.NAME, "res")
  private _resetButton: ElementFinder;

  @findBy(How.ID, "message14")
  private _costumerIDMessage: ElementFinder;

  //#endregion

  //#region GetterMethods

  /**
   * Return costumer id locator
   */
  public getCostumerIDLocator(): ElementFinder {
    return this._costumerID;
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
   * Return costumer id message locator
   */
  public getCostumerIDMessageLocator(): ElementFinder {
    return this._costumerIDMessage;
  }

  //#endregion
}
