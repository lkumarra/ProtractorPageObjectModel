import { ElementFinder } from "protractor";
import { findBy } from "../../Utils/PageFactory";

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

  @findBy("Name", "cusid")
  private costumerID: ElementFinder;

  @findBy("Name", "AccSubmit")
  private submitButton: ElementFinder;

  @findBy("Name", "res")
  private resetButton: ElementFinder;

  @findBy("Id", "message14")
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
