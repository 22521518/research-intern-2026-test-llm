/*



 */

class SendBack {
    constructor() {
        this.userBalances = {}; // [SIMULATED: mapping]
    }

    withdrawBalance(msg_sender, msg_value) {
        let amountToWithdraw = this.userBalances[msg_sender];
        this.userBalances[msg_sender] = 0n;
        //
        msg_sender.send(amountToWithdraw);
    }
}