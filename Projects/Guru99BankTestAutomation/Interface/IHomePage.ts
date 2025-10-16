import { NewCustomerPage } from "../Pages/Actions/NewCustomerPage";
import { EditCustomerPage } from "../Pages/Actions/EditCustomerPage";
import { DeleteCustomerPage } from "../Pages/Actions/DeleteCustomerPage";
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
   * Click on new customer link available on home page
   */
  clickOnNewCustomerLink(): Promise<NewCustomerPage>;

  /**
   * Click on edit customer link available on home page
   */
  clickOnEditCustomerLink(): Promise<EditCustomerPage>;

  /**
   * Click on Delete Customer link available on home page.
   */
  clickOnDeleteCustomerLink():Promise<DeleteCustomerPage>;
}
