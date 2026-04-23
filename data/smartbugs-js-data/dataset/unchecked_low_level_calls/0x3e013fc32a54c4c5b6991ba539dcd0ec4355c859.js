/*



 */

class MultiplicatorX4 {
    constructor(msg_sender) {
        this.Owner = msg_sender;
        this.balance = 0n; // [SIMULATED: contract balance]
    }

    // [SIMULATED: fallback function]
    fallback(msg_value) {
        this.balance += msg_value;
    }

    withdraw(msg_sender) {
        if (!(msg_sender === this.Owner)) throw new Error("require");
        // [SIMULATED: transfer balance to Owner]
        this.balance = 0n;
    }

    Command(adr, data, msg_sender, msg_value) {
        if (!(msg_sender === this.Owner)) throw new Error("require");
        //
        // [SIMULATED: adr.call.value(msg_value)(data)]
    }

    multiplicate(adr, msg_value) {
        if (msg_value >= this.balance) {
            // [SIMULATED: adr.transfer(this.balance + msg_value)]
            this.balance = 0n;
        }
    }
}