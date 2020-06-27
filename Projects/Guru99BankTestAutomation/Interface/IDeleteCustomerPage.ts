export interface IDeleteCustomerPage{

    /**
     * Return the CustomerId Message 
     * @param customerId Customer Id to enter.
     */
    getCustomerIdMessage(customerId:string):Promise<String>;

}