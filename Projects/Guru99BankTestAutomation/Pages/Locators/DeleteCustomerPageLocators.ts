import { findBy, How } from '../../Utils/PageFactory';
import { ElementFinder } from 'protractor';

let deleteCustomerElements:DeleteCustomerElements = null;

export class DeleteCustomerElements{

    /**
     * Return the instance of DeleteCustomerElements page.
     */
    public static  getInstance():DeleteCustomerElements{
        if (deleteCustomerElements===null){
            deleteCustomerElements = new DeleteCustomerElements();
        }
        return deleteCustomerElements;
    }

    //#region  PageFactory

    @findBy(How.NAME, "cusid")
    private customerId:ElementFinder;

    @findBy(How.NAME, "AccSubmit")
    private submitButton:ElementFinder;

    @findBy(How.NAME, "res")
    private resetButton:ElementFinder;

    @findBy(How.XPATH, "//label[contains(@id, 'message')]")
    private deleteCustomerMessage:ElementFinder;

    //#endregion

    //#endregion GetterMethods.

    /**
     * Return the ElementFinder of CustomerId TextBox.
     * @returns ElementFinder of CustomerID TextBox.
     */
    public getCustomerIDLocator():ElementFinder{
        return this.customerId;
    }

    /**
     * Return the ElementFinder of SubmitButton.
     * @returns ElementFinder of SubmitButton.
     */
    public getSubmitButtonLocator():ElementFinder{
        return this.submitButton;
    }

    /**
     * Return the ElementFinder of ResetButton.
     * @returns ElementFinder of ResetButton.
     */
    public getResetButtonLocator():ElementFinder{
        return this.resetButton;
    }

    /**
     * Return the ElementFinder of CustomerId Message.
     * @returns ElementFinder of CustomerID Message. 
     */
    public getCustomerIdMessageLocator():ElementFinder{
        return this.deleteCustomerMessage
    }

    //#endregion
}