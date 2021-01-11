import { HomePage } from "../Pages/Actions/HomePage";
export interface ILoginPage {

  login(userName: string, password: string): Promise<HomePage>;

  getAlertTextWithoutEnteringUserIdAndPassword(): Promise<String>;

  getUserIdLabelText():Promise<String>;

  getPasswordLabelText():Promise<String>;
}
