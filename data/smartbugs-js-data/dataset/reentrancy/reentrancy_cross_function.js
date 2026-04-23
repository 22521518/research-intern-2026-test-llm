/*



 */

class Reentrancy_cross_function {

    // INSECURE
    constructor() {
        this.userBalances = {}; // [SIMULATED: mapping]
    }

    transfer(to, amount, msg_sender) {
        if (this.userBalances[msg_sender] >= amount) {
            this.userBalances[to] = (this.userBalances[to] || 0n) + amount;
            this.userBalances[msg_sender] -= amount;
        }
    }

    withdrawBalance(msg_sender, msg_value) {
        let amountToWithdraw = this.userBalances[msg_sender];
        //
        let [success, ] = msg_sender.call.value(amountToWithdraw)(""); // [SIMULATED: call.value] // At this point, the caller's code is executed, and can call transfer()
        if (!success) throw new Error("");
        this.userBalances[msg_sender] = 0n;
    }
}