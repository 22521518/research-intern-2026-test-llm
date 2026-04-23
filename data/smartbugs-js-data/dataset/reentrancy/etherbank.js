/*



 */

class EtherBank {
    constructor() {
        this.userBalances = {}; // [SIMULATED: mapping]
    }

    getBalance(user) {
        return this.userBalances[user] || 0n;
    }

    addToBalance(msg_sender, msg_value) {
        this.userBalances[msg_sender] = (this.userBalances[msg_sender] || 0n) + msg_value;
    }

    withdrawBalance(msg_sender) {
        let amountToWithdraw = this.userBalances[msg_sender];
        //
        if (!(/* [SIMULATED: msg.sender.call.value(amountToWithdraw)()] */ true)) { throw new Error(); }
        this.userBalances[msg_sender] = 0n;
    }
}