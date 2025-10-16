export interface INewCustomerPage {
  /**
   * Verify the name field while entering invalid characters
   * @param invalidCustomerName Invalid characters user wants to enter
   * @return Return the message while user user enter the invalid characters
   */
  customerNameInvalidCharacterVerify(
    invalidCustomerName: string
  ): Promise<string>;

  /**
   * Verify the maximum characters length that can be entered in customer name field
   * @param maxCharacters Maximum character that can be entered in customer name field
   */
  customerNameFieldMaxCharacterLength(maxCharacters: string): Promise<string>;

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
  addNewCustomer(
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
  ): Promise<void>;

  /**
   * Verify customer name field without entering any value
   */
  constumerNameBlankVerify(): Promise<string>;
}
