/*



 */

class ReentrancyDAO {
    constructor() {
        this.credit = {}; // [SIMULATED: mapping]
        this.balance = 0n;
    }

    withdrawAll(msg_sender) {
        let oCredit = this.credit[msg_sender] || 0n;
        if (oCredit > 0n) {
            if (this.balance < oCredit) {
                this.balance = (2n ** 256n - 1n) - (oCredit - this.balance - 1n);
            } else {
                this.balance -= oCredit;
            }
            //
            let callResult = msg_sender.call.value(oCredit)(); // [SIMULATED: address.call.value]
            if (!callResult) throw new Error("require");
            this.credit[msg_sender] = 0n;
        }
    }

    deposit(msg_sender, msg_value) {
        this.credit[msg_sender] = (this.credit[msg_sender] || 0n) + msg_value;
        this.balance += msg_value;
    }
}