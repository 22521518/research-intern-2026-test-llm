/*



 */

class Missing {
    owner = "";

    //
    Constructor(msgSender) {
        this.owner = msgSender;
    }

    fallback(msgSender, msgValue) {
        // [SIMULATED: payable]
    }

    withdraw(msgSender) {
        if (!(msgSender === this.owner)) throw new Error("");
        // [SIMULATED: owner.transfer(this.balance)]
    }

}