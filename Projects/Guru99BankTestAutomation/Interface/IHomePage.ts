import { NewCostumerPage } from "../Pages/Actions/NewCostumerPage";
import { EditCostumerPage } from "../Pages/Actions/EditCostumerPage";
export interface IHomePage {

	/**
	*Return the message of welcome message after user login successfully
    */
	verifyWelcomeMessage(): Promise<string>;

	/**
	* Verify the user login successfully by verifying the manager id
	*/
	verifyManagerId(): Promise<string>;

	/**
	 * Click on new costumer link available on home page
	 */
	clickOnNewCostumerLink(): Promise<NewCostumerPage>;

	/**
	 * Click on edit costumer link available on home page
	 */
	clickOnEditCostumerLink(): Promise<EditCostumerPage>;

}