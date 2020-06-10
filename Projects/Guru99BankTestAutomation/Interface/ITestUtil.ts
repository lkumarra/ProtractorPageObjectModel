import { ElementFinder } from "protractor";
export interface ITestUtil {
  /**
   * Get the data from the excel sheet on the basis or row and column values provided by the use
   * @param workSheet Name of the worksheet in the excel
   * @param row Row number from which user wants to read data
   * @param cell Cell number in the given row from which user wants to read data
   */
  getSingleData(workSheet: string, row: number, cell: number): Promise<string>;

  /**
   * Return the data from the excel sheet for data provider
   * @param workSheet Worksheet from which user wants to  read dat
   */
  getMultipleData(workSheet: string): Promise<string[][]>;

  /**
   * Performed click action on the webelement
   * @param webElement Webelement on which click action is performed
   */
  clickOnElement(webElement: ElementFinder): Promise<void>;

  /**
   * Enter text into element after clearing the text box
   * @param webElement Webelement on which values to be enter
   * @param keyValues Values which user wants to enter
   */
  enterTextIntoTextBox(
    webElement: ElementFinder,
    keyValues: string
  ): Promise<void>;

  /**
   * Enter text into text box without clear
   * @param WebElement
   * @param keyValues
   */
  enterTextIntoTextBoxWithoutClear(
    WebElement: ElementFinder,
    keyValues: string
  ): Promise<void>;

  /**
   * Schedule a command to get the text of web elemnt
   * @param webElement Webelement to get text
   * @returns Return the text of the web element
   */
  getWebElementText(webElement: ElementFinder): Promise<string>;

  /** Schedule a command to get the attriute value of web elemnt
   * @param webElement Webelement to get attribute
   */
  getAttributeOfElement(
    webElement: ElementFinder,
    attributeName: string
  ): Promise<string>;

  /**
   * Perform a command to accept the alert
   */
  acceptAlert(): Promise<void>;

  /**
   * Clear the text of textbox.
   * @param webElement
   */
  clearTextBox(webElement: ElementFinder): Promise<void>;

  /**
   * Perform the command to reject the alert
   */
  dimissAlert(): Promise<void>;
}
