import { ElementFinder } from "protractor";
import { findBy, How } from "../../Utils/PageFactory";

let newCostumerElements: NewCostumerElements;

export class NewCostumerElements {
  /**
   * Create the instance of NewCustomerElements class.
   */
  public static getInstance(): NewCostumerElements {
    if (newCostumerElements == null) {
      newCostumerElements = new NewCostumerElements();
    }
    return newCostumerElements;
  }

  //#region  PageFactory

  @findBy(How.NAME, "name")
  private costumerName: ElementFinder;

  @findBy(How.XPATH, "//input[@value = 'm']")
  private maleRadioButton: ElementFinder;

  @findBy(How.XPATH, "//input[@value = 'f']")
  private femaleRadioButton: ElementFinder;

  @findBy(How.NAME, "dob")
  private dob: ElementFinder;

  @findBy(How.XPATH, "//textarea[@name = 'addr']")
  private address: ElementFinder;

  @findBy(How.NAME, "city")
  private city: ElementFinder;

  @findBy(How.NAME, "state")
  private state: ElementFinder;

  @findBy(How.NAME, "pinno")
  private pin: ElementFinder;

  @findBy(How.NAME, "telephoneno")
  private mobile: ElementFinder;

  @findBy(How.NAME, "emailid")
  private email: ElementFinder;

  @findBy(How.NAME, "password")
  private password: ElementFinder;

  @findBy(How.XPATH, '//input[@value  = "Submit"]')
  private submit: ElementFinder;

  @findBy(How.XPATH, '//input[@value  = "Reset"]')
  private reset: ElementFinder;

  @findBy(How.CSS, "label#message")
  private costumerNameMessage: ElementFinder;

  //#region

  //#region  GetterMethods

  /**
   * Return costumer name locator
   */
  public getCostumerNameLocator(): ElementFinder {
    return this.costumerName;
  }

  /**
   * Return male radio button locator
   */
  public getMaleRadioButtonLocator(): ElementFinder {
    return this.maleRadioButton;
  }

  /**
   * Return female radio button locator
   */
  public getFemaleRadioButtonLocator(): ElementFinder {
    return this.femaleRadioButton;
  }

  /**
   * Return date of birth locator
   */
  public getDateOfBirthLocator(): ElementFinder {
    return this.dob;
  }

  /**
   * Return address locator
   */
  public getAddressLocator(): ElementFinder {
    return this.address;
  }

  /**
   * Return city locator
   */
  public getCityLocator(): ElementFinder {
    return this.city;
  }

  /**
   * Return state locator
   */
  public getStateLocator(): ElementFinder {
    return this.state;
  }

  /**
   * Return pin locator
   */
  public getPinCodeLocator(): ElementFinder {
    return this.pin;
  }

  /**
   * Return male locator
   */
  public getMobileLocator(): ElementFinder {
    return this.mobile;
  }

  /**
   * Return email locator
   */
  public getEmailLocator(): ElementFinder {
    return this.email;
  }

  /**
   * Return password locator
   */
  public getPasswordLocator(): ElementFinder {
    return this.password;
  }

  /**
   * Return sub,it locator
   */
  public getSubmitLocator(): ElementFinder {
    return this.submit;
  }

  /**
   * Return reset locator
   */
  public getResetLocator(): ElementFinder {
    return this.reset;
  }

  /**
   * Retrun costmer name message locator
   */
  public getCostumerNameMessageLocator(): ElementFinder {
    return this.costumerNameMessage;
  }

  //#endregion
}
