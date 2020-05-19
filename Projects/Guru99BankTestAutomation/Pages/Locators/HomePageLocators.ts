import { by, Locator } from 'protractor';
let homePageElements: HomePageElements;
export class HomePageElements {

    /**
     * Return the instance of HomePage
     */
    public static getInstance(): HomePageElements {
        if (homePageElements == null) {
            homePageElements = new HomePageElements();
        }
        return homePageElements;
    }
    /**
     * Webelements intialization
     */
    private welcomeMessage: Locator = by.xpath("//marquee[@class = 'heading3']");
    private managerId: Locator = by.css("tr.heading3>td:first-child");
    private newCostumerLink: Locator = by.linkText('New Customer');
    private editCostumerLink: Locator = by.linkText('Edit Customer');
    
     /**
     * Retrun welcome message login;
     */
    public welcomeMessageLocator(): Locator {
        return this.welcomeMessage;
    };

    /**
     * Return managerId locator 
     */
    public managerIdLocator(): Locator {
        return this.managerId;
    }

    /**
     * Return new costume link locator
     */
    public newCostumerLinkLocator(): Locator {
        return this.newCostumerLink;
    }

    /**
     * Return edit costumer link locator
     */
    public editCostumerLinkLocator(): Locator {
        return this.editCostumerLink;
    }

}
