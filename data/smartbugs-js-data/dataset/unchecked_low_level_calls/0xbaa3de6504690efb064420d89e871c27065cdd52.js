/*



 */

class Proxy {
    constructor(msg_sender) {
        this.Owner = msg_sender;
    }

    transferOwner(msg_sender, _owner) {
        if (!(msg_sender == this.Owner)) throw new Error("");
        this.Owner = _owner;
    }

    proxy(msg_sender, msg_value, target, data) {
        //
        // [SIMULATED: target.call.value(msg_value)(data)]
    }
}

class VaultProxy extends Proxy {
    constructor(msg_sender) {
        super(msg_sender);
        this.Owner = "";
        this.Deposits = {}; // [SIMULATED: mapping]
    }

    // [SIMULATED: fallback function]
    fallback(msg_sender, msg_value) { }

    Vault(msg_sender, tx_origin, msg_value) {
        if (msg_sender == tx_origin) {
            this.Owner = msg_sender;
            this.deposit(msg_sender, msg_value);
        }
    }

    deposit(msg_sender, msg_value) {
        if (msg_value > 250000000000000000n) {
            this.Deposits[msg_sender] = (this.Deposits[msg_sender] || 0n) + msg_value;
        }
    }

    withdraw(msg_sender, amount) {
        if (!(msg_sender == this.Owner)) throw new Error("");
        if (amount > 0n && (this.Deposits[msg_sender] || 0n) >= amount) {
            // [SIMULATED: msg_sender.transfer(amount)]
        }
    }
}