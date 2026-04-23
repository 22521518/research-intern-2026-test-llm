/*



 */

class SimpleWallet {
    constructor(msg_sender) {
        this.owner = msg_sender;
        this.depositsCount = 0n;
    }

    // [SIMULATED: fallback function]
    receive(msg_sender, msg_value) {
        this.depositsCount++;
    }
    
    withdrawAll(msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");
        this.withdraw(this.getBalance(), msg_sender);
    }
    
    withdraw(_value, msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");
        // [SIMULATED: transfer]
    }
    
    sendMoney(_target, _value, msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");
        //
        // [SIMULATED: _target.call.value(_value)()]
    }

    getBalance() {
        // [SIMULATED: address(this).balance]
        return 0n;
    }
}