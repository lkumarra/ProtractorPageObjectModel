import { by, Locator } from 'protractor';
let newCostumerElements: NewCostumerElements;
export class NewCostumerElements {

    /**
     * Create the instance of NewCustomerElements class.
     */
    public static getInstance(): NewCostumerElements {
        if (newCostumerElements == null) {
            newCostumerElements = new NewCostumerElements();
        }
        return newCostumerElements;
    }
    
    /**
     * Web element initialization 
     */
    private costumerName: Locator = by.name("name");
    private maleRadioButton: Locator = by.xpath("//input[@value = 'm']");
    private femaleRadioButton: Locator = by.xpath("//input[@value = 'f']");
    private dob: Locator = by.name("dob");
    private address: Locator = by.xpath("//textarea[@name = 'addr']");
    private city: Locator = by.name("city");
    private state: Locator = by.name("state");
    private pin: Locator = by.name("pinno");
    private mobile: Locator = by.name("telephoneno");
    private email: Locator = by.name("emailid");
    private password: Locator = by.name("password");
    private submit: Locator = by.xpath("//input[@value  = \"Submit\"]");
    private reset: Locator = by.xpath("//input[@value  = \"Reset\"]");
    private costumerNameMessage: Locator = by.css("label#message");

    /**
     * Return costumer name locator
     */
    public costumerNameLocator(): Locator {
        return this.costumerName;
    }

    /**
     * Return male radio button locator
     */
    public maleRadioButtonLocator(): Locator {
        return this.maleRadioButton;
    }

    /**
     * Return female radio button locator
     */
    public femaleRadioButtonLocator(): Locator {
        return this.femaleRadioButton;
    }

    /**
     * Return date of birth locator
     */
    public dateOfBirthLocator(): Locator {
        return this.dob;
    }

    /**
     * Return address locator
     */
    public addressLocator(): Locator {
        return this.address;
    }

    /**
     * Return city locator
     */
    public cityLocator(): Locator {
        return this.city;
    }

    /**
     * Return state locator
     */
    public stateLocator(): Locator {
        return this.state;
    }

    /**
     * Return pin locator
     */
    public pinCodeLocator(): Locator {
        return this.pin;
    }

    /**
     * Return male locator
     */
    public mobileLocator(): Locator {
        return this.mobile;
    }

    /**
     * Return email locator
     */
    public emailLocator(): Locator {
        return this.email;
    }

    /**
     * Return password locator
     */
    public passwordLocator(): Locator {
        return this.password;
    }

    /**
     * Return sub,it locator
     */
    public submitLocator(): Locator {
        return this.submit;
    }

    /**
     * Return reset locator
     */
    public resetLocator(): Locator {
        return this.reset;
    }

    /**
     * Retrun costmer name message locator
     */
    public costumerNameMessageLocator(): Locator {
        return this.costumerNameMessage;
    }


}
