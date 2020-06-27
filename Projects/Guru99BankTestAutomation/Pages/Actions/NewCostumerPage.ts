import { TestUtil } from "../../Utils/TestUtil";
import { NewCostumerElements } from "../Locators/NewCostumerPageLocators";
import { INewCostumerPage } from "../../Interface/INewCostumerPage";
import { LogUtils } from "../../LogManager/LogUtils";

let newCostumerElements: NewCostumerElements = NewCostumerElements.getInstance();
let testUtil: TestUtil = TestUtil.getInstance();

export class NewCostumerPage implements INewCostumerPage {
  className: string = NewCostumerPage.name;

  /**
   * Set costumer name on new costumer page
   * @param costumerName Costume name to be set
   */
  public async setCostumerName(costumerName: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getCostumerNameLocator(),
      costumerName
    );
    LogUtils.debugMessage(
      "CustomerName : " + costumerName + " is entered",
      this.className
    );
  }

  /**
   * Select male gender on new costumer page
   */
  public async selectMale() {
    await testUtil.clickOnElement(
      newCostumerElements.getMaleRadioButtonLocator()
    );
    LogUtils.debugMessage("Male option is Selected", this.className);
  }

  /**
   * Select female gender on new costume page
   */
  public async selectFemale() {
    await testUtil.clickOnElement(
      newCostumerElements.getFemaleRadioButtonLocator()
    );
    LogUtils.debugMessage("Female option is selected ", this.className);
  }

  /**
   * Set date of birth on new costumer page
   * @param dob Date of birth to be set
   */
  public async setDateOfBirth(dob: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getDateOfBirthLocator(),
      dob
    );
    LogUtils.debugMessage(
      "Date of Birth : " + dob + " is entered",
      this.className
    );
  }

  /**
   * Set address on new costumer page
   * @param address Address to be set
   */
  public async setAddress(address: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getAddressLocator(),
      address
    );
    LogUtils.debugMessage(
      "Address : " + address + " is entered",
      this.className
    );
  }

  /**
   * Set city on new costumer page
   * @param city City to be set
   */
  public async setCity(city: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getCityLocator(),
      city
    );
    LogUtils.debugMessage("City : " + city + " is entered", this.className);
  }

  /**
   * Set state on new costumer page
   * @param state State to be set
   */
  public async setState(state: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getStateLocator(),
      state
    );
    LogUtils.debugMessage("State : " + state + " is entered", this.className);
  }

  /**
   * Set pin code on new costumer page
   * @param pin Pin code to be select
   */
  public async setPinCode(pin: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getPinCodeLocator(),
      pin
    );
    LogUtils.debugMessage("Pin : " + pin + " is entered", this.className);
  }

  /**
   * Set mobile on new costumer page
   * @param mobile Mobile number to be set
   */
  public async setMobileNumber(mobile: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getMobileLocator(),
      mobile
    );
    LogUtils.debugMessage(
      "Mobile Number : " + mobile + " is entered",
      this.className
    );
  }

  /**
   * Set email on new costumer page
   * @param email Email to be set
   */
  public async setEmail(email: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getEmailLocator(),
      email
    );
    LogUtils.debugMessage("Email : " + email + " is entered", this.className);
  }

  /**
   * Set password on new costumer page
   * @param password Password to be set
   */
  public async setPassword(password: string) {
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getPasswordLocator(),
      password
    );
    LogUtils.debugMessage(
      "Password : " + password + " is entered",
      this.className
    );
  }

  /**
   * Click on subbmit button
   */
  public async clickOnSubmit() {
    await testUtil.clickOnElement(newCostumerElements.getSubmitLocator());
    LogUtils.debugMessage("Clicked on Submit Button", this.className);
  }

  /**
   * Click on reset button
   */
  public async clickOnReset() {
    await testUtil.clickOnElement(newCostumerElements.getResetLocator());
    LogUtils.debugMessage("Clicked on Reset Button", this.className);
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
  public async addNewCostumer(
    costumerName: string,
    gender: string,
    dob: string,
    address: string,
    city: string,
    state: string,
    pin: string,
    mobileNumber: string,
    email: string,
    password: string
  ): Promise<void> {
    await this.setCostumerName(costumerName);
    if (gender === "Male") {
      await this.selectMale();
    } else {
      await this.selectFemale();
    }
    await this.setDateOfBirth(dob);
    await this.setAddress(address);
    await this.setCity(city);
    await this.setState(state);
    await this.setPinCode(pin);
    await this.setMobileNumber(mobileNumber);
    await this.setEmail(email);
    await this.setPassword(password);
    await this.clickOnSubmit();
  }

  /**
   * Verify the name field while entering invalid characters
   *
   * @param invalidCostumerName Invalid characters user wants to enter
   * @return Return the message while user user enter the invalid characters
   */
  public async costumerNameInvalidCharacterVerify(
    invalidCostumerName: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "costumerNameInvalidCharacterVerify execution stated ",
      this.className
    );
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getCostumerNameLocator(),
      invalidCostumerName
    );
    let text: string = await testUtil.getWebElementText(
      newCostumerElements.getCostumerNameMessageLocator()
    );
    LogUtils.debugMessage(
      "Invaid message : " + text + " is displayed",
      this.className
    );
    return text;
  }

  /**
   * Verify the maximum characters length that can be entered in costumer name field
   * @param maxCharacters Maximum character that can be entered in costumer name field
   */
  public async costumerNameFieldMaxCharacterLength(
    maxCharacters: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "Maximum charactes : " + maxCharacters + " are enterd",
      NewCostumerPage.name
    );
    await testUtil.enterTextIntoTextBox(
      newCostumerElements.getCostumerNameLocator(),
      maxCharacters
    );
    let lenght: string = (
      await testUtil.getAttributeOfElement(
        newCostumerElements.getCostumerNameLocator(),
        "value"
      )
    ).length.toString();
    LogUtils.debugMessage(
      "The lenghts of characters is : " + lenght,
      NewCostumerPage.name
    );
    return lenght;
  }

  /**
   * Verify costumer name field message without entering any value.
   */
  public async constumerNameBlankVerify(): Promise<string> {
    LogUtils.debugMessage(
      "constumerNameBlankVerify executation started",
      this.className
    );
    await testUtil.clearTextBox(newCostumerElements.getCostumerNameLocator());
    await testUtil.clickOnElement(newCostumerElements.getCostumerNameLocator());
    await testUtil.clickOnElement(newCostumerElements.getDateOfBirthLocator());
    let text: string = await testUtil.getWebElementText(
      newCostumerElements.getCostumerNameMessageLocator()
    );
    LogUtils.debugMessage(
      "The message is : " + text + " is displated",
      this.className
    );
    return text;
  }
}
