/*



 */

// [SIMULATED: pragma solidity ^0.5.0;]

class Reentrancy_insecure {

    // INSECURE
    constructor() {
        this.userBalances = {};
    }

    withdrawBalance(msg_sender, msg_value) {
        let amountToWithdraw = this.userBalances[msg_sender] || 0n;
        //
        let [success, ] = [/* [SIMULATED: msg.sender.call.value(amountToWithdraw)("")] */ true, ""]; 
        if (!success) throw new Error("require(success)");
        this.userBalances[msg_sender] = 0n;
    }
}