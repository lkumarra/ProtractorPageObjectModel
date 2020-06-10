import { HomePage } from "../Pages/Actions/HomePage";
export interface ILoginPage {
  /**
   * Enter the login credentials on login page
   * @param userName Username of the user
   * @param pasword Password of the user
   */
  login(userName: string, password: string): Promise<HomePage>;
}
