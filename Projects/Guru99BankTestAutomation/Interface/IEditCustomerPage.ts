export interface IEditCustomerPage {
  /**
   * Verify the customerid message by entering invalid characters in customer id field
   * @param characters
   */
  verifyCustomerIdWithInvalidCharacters(characters: string): Promise<string>;

  /**
   * Verify the alert text on by entering invalid characters in customer id field
   * @param characters
   */
  verifyCustomerIDAlertMessage(characters: string): Promise<string>;
}
