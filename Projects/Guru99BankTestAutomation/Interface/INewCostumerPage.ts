export interface INewCostumer {

    /**
      * Verify the name field while entering invalid characters
      * @param invalidCostumerName Invalid characters user wants to enter
      * @return Return the message while user user enter the invalid characters
      */
    costumerNameInvalidCharacterVerify(invalidCostumerName: string): Promise<string>;

    /**
     * Verify the maximum characters length that can be entered in costumer name field
     * @param maxCharacters Maximum character that can be entered in costumer name field
     */
    costumerNameFieldMaxCharacterLength(maxCharacters: string): Promise<string>;

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
    addNewCostumer(costumerName: string, gender: string, dob: string, address: string, city: string,
        state: string, pin: string, mobileNumber: string, email: string, password: string): Promise<void>;
    
    /**
     * Verify costumer name field without entering any value
     */
    constumerNameBlankVerify():Promise<string>; 
}