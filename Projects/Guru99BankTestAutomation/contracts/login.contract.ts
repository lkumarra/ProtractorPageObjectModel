import { HomePage } from "../pages/actions/homePage.page";
export interface ILoginPage {

  login(userName: string, password: string): Promise<HomePage>;

  getAlertTextWithoutEnteringUserIdAndPassword(): Promise<String>;

  getUserIdLabelText():Promise<String>;

  getPasswordLabelText():Promise<String>;
}
