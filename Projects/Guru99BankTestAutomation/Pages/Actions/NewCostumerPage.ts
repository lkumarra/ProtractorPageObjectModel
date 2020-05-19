import { TestUtil } from '../../Utils/TestUtil';
import { NewCostumerElements } from '../Locators/NewCostumerPageLocators';
import { INewCostumer } from '../../Interface/INewCostumerPage';
import { LogUtils } from '../../LogManager/LogUtils';
let newCostumerElements: NewCostumerElements = NewCostumerElements.getInstance();
let testUtil: TestUtil = TestUtil.getInstance();
export class NewCostumerPage implements INewCostumer {

    /**
     * Set costumer name on new costumer page
     * @param costumerName Costume name to be set
     */
    public async setCostumerName(costumerName: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.costumerNameLocator(), costumerName);
    }

    /**
     * Select male gender on new costumer page
     */
    public async selectMale() {
        await testUtil.clickOnElement(newCostumerElements.maleRadioButtonLocator());
    }

    /**
     * Select female gender on new costume page
     */
    public async selectFemale() {
        await testUtil.clickOnElement(newCostumerElements.femaleRadioButtonLocator());
    }

    /**
     * Set date of birth on new costumer page
     * @param dob Date of birth to be set
     */
    public async setDateOfBirth(dob: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.dateOfBirthLocator(), dob)
    }

    /**
     * Set address on new costumer page 
     * @param address Address to be set
     */
    public async setAddress(address: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.addressLocator(), address);
    }

    /**
     * Set city on new costumer page
     * @param city City to be set
     */
    public async setCity(city: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.cityLocator(), city);
    }

    /**
     * Set state on new costumer page
     * @param state State to be set
     */
    public async setState(state: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.stateLocator(), state);
    }

    /**
     * Set pin code on new costumer page
     * @param pin Pin code to be select
     */
    public async setPinCode(pin: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.pinCodeLocator(), pin);
    }

    /**
     * Set mobile on new costumer page
     * @param mobile Mobile number to be set
     */
    public async setMobileNumber(mobile: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.mobileLocator(), mobile);
    }

    /**
     * Set email on new costumer page
     * @param email Email to be set
     */
    public async setEmail(email: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.emailLocator(), email);
    }

    /**
     * Set password on new costumer page
     * @param password Password to be set
     */
    public async setPassword(password: string) {
        await testUtil.enterTextIntoTextBox(newCostumerElements.passwordLocator(), password);
    }

    /**
     * Click on subbmit button
     */
    public async clickOnSubmit() {
        await testUtil.clickOnElement(newCostumerElements.submitLocator())
    }

    /**
     * Click on reset button
     */
    public async clickOnReset() {
        await testUtil.clickOnElement(newCostumerElements.resetLocator())
    }
    /**
	 * Add the details in add new costumer form
	 * 
	 * @param costumerName Name of the costumer
	 * @param gender       Gender of the costumer
	 * @param dob          Date of the birth of the costumer
	 * @param address      Address of the costumer
	 * @param city         City of the costumer
	 * @param state        State of the costumer
	 * @param pin          Pin code of the costumer
	 * @param mobileNumber Mobile Number of the costumer
	 * @param email        Email id if the costumer
	 * @param password     Password of the costumer
	 */
    public async addNewCostumer(costumerName: string, gender: string, dob: string, address: string, city: string,
        state: string, pin: string, mobileNumber: string, email: string, password: string): Promise<void> {
        LogUtils.debugMessage("Add new customer is executing", NewCostumerPage.name);
        await this.setCostumerName(costumerName);
        LogUtils.debugMessage("Customer name " + costumerName + " is entered", NewCostumerPage.name);
        if (gender === "Male") {
            await this.selectMale();
            LogUtils.debugMessage("Gender male is selected", NewCostumerPage.name);
        } else {
            await this.selectFemale();
            LogUtils.debugMessage("Gender female is selected", NewCostumerPage.name);
        }
        await this.setDateOfBirth(dob);
        LogUtils.debugMessage("Date of birth " + dob + " is entered", NewCostumerPage.name);
        await this.setAddress(address);
        LogUtils.debugMessage("Address " + address + " is entered", NewCostumerPage.name);
        await this.setCity(city);
        LogUtils.debugMessage("City " + city + " is entered", NewCostumerPage.name);
        await this.setState(state);
        LogUtils.debugMessage("State " + state + " is entered", NewCostumerPage.name);
        await this.setPinCode(pin)
        LogUtils.debugMessage("Pin code" + pin + " is entered", NewCostumerPage.name);
        await this.setMobileNumber(mobileNumber);
        LogUtils.debugMessage("Mobile Number " + mobileNumber + " is entered", NewCostumerPage.name);
        await this.setEmail(email);
        LogUtils.debugMessage("Email " + email + " is entered", NewCostumerPage.name);
        await this.setPassword(password);
        LogUtils.debugMessage("Password " + password + " is entered", NewCostumerPage.name);
        await this.clickOnSubmit();
        LogUtils.debugMessage("Clicked on submit button", NewCostumerPage.name);
    }

    /**
      * Verify the name field while entering invalid characters
      * 
      * @param invalidCostumerName Invalid characters user wants to enter
      * @return Return the message while user user enter the invalid characters
      */
    public async costumerNameInvalidCharacterVerify(invalidCostumerName: string): Promise<string> {
        LogUtils.debugMessage("costumerNameInvalidCharacterVerify execution stated", NewCostumerPage.name);
        await testUtil.enterTextIntoTextBox(newCostumerElements.costumerNameLocator(), invalidCostumerName);
        LogUtils.debugMessage("customer name " + invalidCostumerName + " is entered", NewCostumerPage.name);
        let text: string = await testUtil.getWebElementText(newCostumerElements.costumerNameMessageLocator());
        LogUtils.debugMessage("Invaid message " + text + " is shown", NewCostumerPage.name);
        return text
    }

    /**
     * Verify the maximum characters length that can be entered in costumer name field
     * @param maxCharacters Maximum character that can be entered in costumer name field
     */
    public async costumerNameFieldMaxCharacterLength(maxCharacters: string): Promise<string> {
        LogUtils.debugMessage("Maximum charactes "+maxCharacters+ " are enterd", NewCostumerPage.name);
        await testUtil.enterTextIntoTextBox(newCostumerElements.costumerNameLocator(), maxCharacters);
        let lenght:string = (await testUtil.getAttributeOfElement(newCostumerElements.costumerNameLocator(), "value")).length.toString();
        LogUtils.debugMessage("The lenghts of characters is "+lenght, NewCostumerPage.name);
        return lenght;
    }

    /**
     * Verify costumer name field message without entering any value.
     */
    public async constumerNameBlankVerify(): Promise<string> {
        await testUtil.clickOnElement(newCostumerElements.costumerNameLocator());
        await testUtil.clickOnElement(newCostumerElements.dateOfBirthLocator());
        return await testUtil.getWebElementText(newCostumerElements.costumerNameMessageLocator());
    }
}