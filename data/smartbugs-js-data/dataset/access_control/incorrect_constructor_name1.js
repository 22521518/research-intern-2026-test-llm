/*



 */

class Missing {
    owner = "";

    // The name of the constructor should be Missing
    // Anyone can call the IamMissing once the contract is deployed
    //
    IamMissing(msgSender) {
        this.owner = msgSender;
    }

    fallback(msgSender, msgValue) {
    }

    withdraw(msgSender) {
        if (!(msgSender === this.owner)) throw new Error();
        // [SIMULATED: this.owner.transfer(this.balance)]
    }
}