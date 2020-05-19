import { TestUtil } from '../../Utils/TestUtil';
import { EditCostumerElements } from '../Locators/EditCostumerPageLocators';
import { IEditCostumer } from '../../Interface/IEditCostumerPage';
let testUtil: TestUtil = TestUtil.getInstance();
let editCostumerElemets: EditCostumerElements = EditCostumerElements.getInstance();
export class EditCostumerPage implements IEditCostumer {

    /**
     * Enter text on costumer id field on edit costumer page
     * @param costumerId 
     */
    public async setCostumerId(costumerId: string) {
        await testUtil.enterTextIntoTextBox(editCostumerElemets.costumerIDLocator(), costumerId);
    }

    /**
     * Click on submit button on edit costumer page
     */
    public async clickOnSubmitButton() {
        await testUtil.clickOnElement(editCostumerElemets.submitButtonLocator());
    }

    /**
     * Click on reset button on edit costumer page
     */
    public async clickOnResetButton() {
        await testUtil.clickOnElement(editCostumerElemets.resetButtonLocator());
    }

    /**
     * Return the message of costumer id
     */
    public async getCostumerIDMessage(): Promise<string> {
        return testUtil.getWebElementText(editCostumerElemets.costumerIDMessageLocator());
    }

    /**
     * Verify the costumerid message by entering invalid characters in costumer id field
     * @param characters 
     */
    public async verifyCostumerIdWithInvalidCharacters(characters: string): Promise<string> {
        await this.setCostumerId(characters);
        return this.getCostumerIDMessage();
    }

    /**
     * Verify the alert text on by entering invalid characters in costumer id field
     * @param characters 
     */
    public async verifyCostumerIDAlertMessage(characters: string): Promise<string> {
        await this.setCostumerId(characters);
        await this.clickOnSubmitButton();
        let text: string = await testUtil.getAlertText();
        await testUtil.acceptAlert();
        return text;
    }
}