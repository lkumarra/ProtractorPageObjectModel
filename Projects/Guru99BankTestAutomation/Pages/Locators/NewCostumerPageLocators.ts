import { ElementFinder } from "protractor";
import { findBy, How } from "../../Utils/PageFactory";

export class NewCostumerElements {
  private static _instance: NewCostumerElements = new NewCostumerElements();
  /**
   * Create the instance of NewCustomerElements class.
   */
  public static getInstance(): NewCostumerElements {
    return this._instance;
  }

  //#region  PageFactory

  @findBy(How.NAME, "name")
  private _costumerName: ElementFinder;

  @findBy(How.XPATH, "//input[@value = 'm']")
  private _maleRadioButton: ElementFinder;

  @findBy(How.XPATH, "//input[@value = 'f']")
  private _femaleRadioButton: ElementFinder;

  @findBy(How.NAME, "dob")
  private _dob: ElementFinder;

  @findBy(How.XPATH, "//textarea[@name = 'addr']")
  private _address: ElementFinder;

  @findBy(How.NAME, "city")
  private _city: ElementFinder;

  @findBy(How.NAME, "state")
  private _state: ElementFinder;

  @findBy(How.NAME, "pinno")
  private _pin: ElementFinder;

  @findBy(How.NAME, "telephoneno")
  private _mobile: ElementFinder;

  @findBy(How.NAME, "emailid")
  private _email: ElementFinder;

  @findBy(How.NAME, "password")
  private _password: ElementFinder;

  @findBy(How.XPATH, "//input[@value  = 'Submit']")
  private _submit: ElementFinder;

  @findBy(How.XPATH, "//input[@value  = 'Reset']")
  private _reset: ElementFinder;

  @findBy(How.CSS, "label#message")
  private _costumerNameMessage: ElementFinder;

  //#region

  //#region  GetterMethods

  /**
   * Return costumer name locator
   */
  public getCostumerNameLocator(): ElementFinder {
    return this._costumerName;
  }

  /**
   * Return male radio button locator
   */
  public getMaleRadioButtonLocator(): ElementFinder {
    return this._maleRadioButton;
  }

  /**
   * Return female radio button locator
   */
  public getFemaleRadioButtonLocator(): ElementFinder {
    return this._femaleRadioButton;
  }

  /**
   * Return date of birth locator
   */
  public getDateOfBirthLocator(): ElementFinder {
    return this._dob;
  }

  /**
   * Return address locator
   */
  public getAddressLocator(): ElementFinder {
    return this._address;
  }

  /**
   * Return city locator
   */
  public getCityLocator(): ElementFinder {
    return this._city;
  }

  /**
   * Return state locator
   */
  public getStateLocator(): ElementFinder {
    return this._state;
  }

  /**
   * Return pin locator
   */
  public getPinCodeLocator(): ElementFinder {
    return this._pin;
  }

  /**
   * Return male locator
   */
  public getMobileLocator(): ElementFinder {
    return this._mobile;
  }

  /**
   * Return email locator
   */
  public getEmailLocator(): ElementFinder {
    return this._email;
  }

  /**
   * Return password locator
   */
  public getPasswordLocator(): ElementFinder {
    return this._password;
  }

  /**
   * Return sub,it locator
   */
  public getSubmitLocator(): ElementFinder {
    return this._submit;
  }

  /**
   * Return reset locator
   */
  public getResetLocator(): ElementFinder {
    return this._reset;
  }

  /**
   * Retrun costmer name message locator
   */
  public getCostumerNameMessageLocator(): ElementFinder {
    return this._costumerNameMessage;
  }

  //#endregion
}
