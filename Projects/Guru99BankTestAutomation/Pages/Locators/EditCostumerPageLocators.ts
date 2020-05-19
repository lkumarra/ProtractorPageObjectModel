import { Locator, by } from 'protractor';
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

    private costumerID: Locator = by.name("cusid");
    private submitButton: Locator = by.name("AccSubmit");
    private resetButton: Locator = by.name("res");
    private costumerIDMessage: Locator = by.id("message14");

    /**
     * Return costumer id locator
     */
    public costumerIDLocator(): Locator {
        return this.costumerID;
    }

    /**
     * Return submit button locator
     */
    public submitButtonLocator(): Locator {
        return this.submitButton;
    }

    /**
     * Return reset button locator
     */
    public resetButtonLocator(): Locator {
        return this.resetButton;
    }

    /**
     * Return costumer id message locator
     */
    public costumerIDMessageLocator(): Locator {
        return this.costumerIDMessage;
    }

}
