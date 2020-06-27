import { ElementFinder } from "protractor";
import { findBy, How } from '../../Utils/PageFactory';

let editCostumerElements: EditCostumerElements;
export class EditCostumerElements {
  /**
   * Return the object of Edit costumer elements
   */
  public static getInstance(): EditCostumerElements {
    if (editCostumerElements == null) {
      editCostumerElements = new EditCostumerElements();
    }
    return editCostumerElements;
  }

  //#region  PageFactory

  @findBy(How.NAME, "cusid")
  private costumerID: ElementFinder;

  @findBy(How.NAME, "AccSubmit")
  private submitButton: ElementFinder;

  @findBy(How.NAME, "res")
  private resetButton: ElementFinder;

  @findBy(How.ID, "message14")
  private costumerIDMessage: ElementFinder;

  //#endregion

  //#region GetterMethods

  /**
   * Return costumer id locator
   */
  public getCostumerIDLocator(): ElementFinder {
    return this.costumerID;
  }

  /**
   * Return submit button locator
   */
  public getSubmitButtonLocator(): ElementFinder {
    return this.submitButton;
  }

  /**
   * Return reset button locator
   */
  public getResetButtonLocator(): ElementFinder {
    return this.resetButton;
  }

  /**
   * Return costumer id message locator
   */
  public getCostumerIDMessageLocator(): ElementFinder {
    return this.costumerIDMessage;
  }

  //#endregion
}
