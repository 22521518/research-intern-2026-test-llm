/*



 */

class Proxy {
    constructor(msg_sender) {
        this.Owner = msg_sender;
    }
    // [SIMULATED: modifier onlyOwner]
    transferOwner(msg_sender, _owner) { if (!(msg_sender == this.Owner)) throw new Error(""); this.Owner = _owner; } 
    proxy(msg_value, target, data) {
        //
        // [SIMULATED: target.call.value(msg.value)(data)]
    }
}

class DepositProxy extends Proxy {
    constructor(msg_sender) {
        super(msg_sender);
        this.Owner = "";
        this.Deposits = {};
    }
    
    // [SIMULATED: function () public payable { }]
    
    Vault(msg_sender, tx_origin, msg_value) {
        if (msg_sender == tx_origin) {
            this.Owner = msg_sender;
            this.deposit(msg_value, msg_sender);
        }
    }
    
    deposit(msg_value, msg_sender) {
        if (msg_value > 500000000000000000n) {
            this.Deposits[msg_sender] += msg_value;
        }
    }
    
    withdraw(msg_sender, amount) { if (!(msg_sender == this.Owner)) throw new Error("");
        if (amount > 0n && this.Deposits[msg_sender] >= amount) {
            // [SIMULATED: msg.sender.transfer(amount)]
        }
    }
}