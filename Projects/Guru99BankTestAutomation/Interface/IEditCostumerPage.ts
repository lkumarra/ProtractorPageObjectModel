export interface IEditCostumerPage {
  /**
   * Verify the costumerid message by entering invalid characters in costumer id field
   * @param characters
   */
  verifyCostumerIdWithInvalidCharacters(characters: string): Promise<string>;

  /**
   * Verify the alert text on by entering invalid characters in costumer id field
   * @param characters
   */
  verifyCostumerIDAlertMessage(characters: string): Promise<string>;
}
