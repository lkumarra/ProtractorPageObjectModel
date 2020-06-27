import { browser } from "protractor";
export class Page {
  /**
   * Enter the url and performed initial steps
   * @param url Url of the application
   */
  public static async initalization(url: string) {
    await browser.waitForAngularEnabled(false);
    await browser.get(url);
    await browser.manage().deleteAllCookies();
    await browser.manage().window().maximize();
    console.log("Height is ******"+ await (await browser.manage().window().getSize()).height.toString())
    console.log("Width is ***"+await (await browser.manage().window().getSize()).width.toString())
  }
}
