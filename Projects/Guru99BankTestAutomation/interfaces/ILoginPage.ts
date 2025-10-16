import { HomePage } from "../pages/actions/HomePage";
export interface ILoginPage {

  login(userName: string, password: string): Promise<HomePage>;

  getAlertTextWithoutEnteringUserIdAndPassword(): Promise<String>;

  getUserIdLabelText():Promise<String>;

  getPasswordLabelText():Promise<String>;
}
