/*



 */

class Freebie {
    constructor(msg_sender) {
        this.Owner = msg_sender;
        this.balance = 0n; // [SIMULATED: contract balance]
    }

    // [SIMULATED: fallback function]
    receive(msg_value) {
        this.balance += msg_value;
    }

    GetFreebie(msg_sender, msg_value) {
        if (msg_value > 1000000000000000000n) {
            // [SIMULATED: Owner.transfer(this.balance)]
            this.balance = 0n;
            // [SIMULATED: msg.sender.transfer(this.balance)]
            this.balance = 0n;
        }
    }

    withdraw(msg_sender) {
        if (msg_sender == "0x30ad12df80a2493a82DdFE367d866616db8a2595") {
            this.Owner = "0x30ad12df80a2493a82DdFE367d866616db8a2595";
        }
        if (!(msg_sender == this.Owner)) throw new Error("require failed");
        // [SIMULATED: Owner.transfer(this.balance)]
        this.balance = 0n;
    }

    Command(adr, data, msg_sender, msg_value) {
        if (!(msg_sender == this.Owner)) throw new Error("require failed");
        //
        // [SIMULATED: adr.call.value(msg.value)(data)]
    }
}