import { TestUtil, LogUtils } from "../../exports/ExportUtils";
import { NewCustomerElements } from "../../exports/ExportLocators";
import { INewCustomerPage } from "../../exports/ExportInterface";

export class NewCustomerPage implements INewCustomerPage {
  private _newCustomerElements: NewCustomerElements = NewCustomerElements.getInstance();
  private _testUtil: TestUtil = TestUtil.getInstance();
  className: string = NewCustomerPage.name;

  /**
   * Set customer name on new customer page
   * @param customerName Costume name to be set
   */
  public async setCustomerName(customerName: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getCustomerNameLocator(),
      customerName
    );
    LogUtils.debugMessage(
      "CustomerName : " + customerName + " is entered",
      this.className
    );
  }

  /**
   * Select male gender on new customer page
   */
  public async selectMale() {
    await this._testUtil.clickOnElement(
      this._newCustomerElements.getMaleRadioButtonLocator()
    );
    LogUtils.debugMessage("Male option is Selected", this.className);
  }

  /**
   * Select female gender on new costume page
   */
  public async selectFemale() {
    await this._testUtil.clickOnElement(
      this._newCustomerElements.getFemaleRadioButtonLocator()
    );
    LogUtils.debugMessage("Female option is selected ", this.className);
  }

  /**
   * Set date of birth on new customer page
   * @param dob Date of birth to be set
   */
  public async setDateOfBirth(dob: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getDateOfBirthLocator(),
      dob
    );
    LogUtils.debugMessage(
      "Date of Birth : " + dob + " is entered",
      this.className
    );
  }

  /**
   * Set address on new customer page
   * @param address Address to be set
   */
  public async setAddress(address: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getAddressLocator(),
      address
    );
    LogUtils.debugMessage(
      "Address : " + address + " is entered",
      this.className
    );
  }

  /**
   * Set city on new customer page
   * @param city City to be set
   */
  public async setCity(city: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getCityLocator(),
      city
    );
    LogUtils.debugMessage("City : " + city + " is entered", this.className);
  }

  /**
   * Set state on new customer page
   * @param state State to be set
   */
  public async setState(state: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getStateLocator(),
      state
    );
    LogUtils.debugMessage("State : " + state + " is entered", this.className);
  }

  /**
   * Set pin code on new customer page
   * @param pin Pin code to be select
   */
  public async setPinCode(pin: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getPinCodeLocator(),
      pin
    );
    LogUtils.debugMessage("Pin : " + pin + " is entered", this.className);
  }

  /**
   * Set mobile on new customer page
   * @param mobile Mobile number to be set
   */
  public async setMobileNumber(mobile: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getMobileLocator(),
      mobile
    );
    LogUtils.debugMessage(
      "Mobile Number : " + mobile + " is entered",
      this.className
    );
  }

  /**
   * Set email on new customer page
   * @param email Email to be set
   */
  public async setEmail(email: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getEmailLocator(),
      email
    );
    LogUtils.debugMessage("Email : " + email + " is entered", this.className);
  }

  /**
   * Set password on new customer page
   * @param password Password to be set
   */
  public async setPassword(password: string) {
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getPasswordLocator(),
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
    await this._testUtil.clickOnElement(
      this._newCustomerElements.getSubmitLocator()
    );
    LogUtils.debugMessage("Clicked on Submit Button", this.className);
  }

  /**
   * Click on reset button
   */
  public async clickOnReset() {
    await this._testUtil.clickOnElement(
      this._newCustomerElements.getResetLocator()
    );
    LogUtils.debugMessage("Clicked on Reset Button", this.className);
  }
  /**
   * Add the details in add new customer form
   *
   * @param customerName Name of the customer
   * @param gender       Gender of the customer
   * @param dob          Date of the birth of the customer
   * @param address      Address of the customer
   * @param city         City of the customer
   * @param state        State of the customer
   * @param pin          Pin code of the customer
   * @param mobileNumber Mobile Number of the customer
   * @param email        Email id if the customer
   * @param password     Password of the customer
   */
  public async addNewCustomer(
    customerName: string,
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
    await this.setCustomerName(customerName);
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
   * @param invalidCustomerName Invalid characters user wants to enter
   * @return Return the message while user user enter the invalid characters
   */
  public async customerNameInvalidCharacterVerify(
    invalidCustomerName: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "customerNameInvalidCharacterVerify execution stated ",
      this.className
    );
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getCustomerNameLocator(),
      invalidCustomerName
    );
    let text: string = await this._testUtil.getWebElementText(
      this._newCustomerElements.getCustomerNameMessageLocator()
    );
    LogUtils.debugMessage(
      "Invaid message : " + text + " is displayed",
      this.className
    );
    return text;
  }

  /**
   * Verify the maximum characters length that can be entered in customer name field
   * @param maxCharacters Maximum character that can be entered in customer name field
   */
  public async customerNameFieldMaxCharacterLength(
    maxCharacters: string
  ): Promise<string> {
    LogUtils.debugMessage(
      "Maximum charactes : " + maxCharacters + " are enterd",
      NewCustomerPage.name
    );
    await this._testUtil.enterTextIntoTextBox(
      this._newCustomerElements.getCustomerNameLocator(),
      maxCharacters
    );
    let lenght: string = (
      await this._testUtil.getAttributeOfElement(
        this._newCustomerElements.getCustomerNameLocator(),
        "value"
      )
    ).length.toString();
    LogUtils.debugMessage(
      "The lenghts of characters is : " + lenght,
      NewCustomerPage.name
    );
    return lenght;
  }

  /**
   * Verify customer name field message without entering any value.
   */
  public async constumerNameBlankVerify(): Promise<string> {
    LogUtils.debugMessage(
      "constumerNameBlankVerify executation started",
      this.className
    );
    await this._testUtil.clearTextBox(
      this._newCustomerElements.getCustomerNameLocator()
    );
    await this._testUtil.clickOnElement(
      this._newCustomerElements.getCustomerNameLocator()
    );
    await this._testUtil.clickOnElement(
      this._newCustomerElements.getDateOfBirthLocator()
    );
    let text: string = await this._testUtil.getWebElementText(
      this._newCustomerElements.getCustomerNameMessageLocator()
    );
    LogUtils.debugMessage(
      "The message is : " + text + " : is displayed",
      this.className
    );
    return text;
  }
}
