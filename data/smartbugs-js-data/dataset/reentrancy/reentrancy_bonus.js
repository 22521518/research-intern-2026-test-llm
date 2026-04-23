/*



 */

// [SIMULATED: pragma solidity ^0.4.24;]

class Reentrancy_bonus {
    constructor() {
        // INSECURE
        this.userBalances = {}; // [SIMULATED: mapping (address => uint) private userBalances;]
        this.claimedBonus = {}; // [SIMULATED: mapping (address => bool) private claimedBonus;]
        this.rewardsForA = {}; // [SIMULATED: mapping (address => uint) private rewardsForA;]
    }

    withdrawReward(recipient, msg_sender, msg_value) {
        let amountToWithdraw = this.rewardsForA[recipient] || 0n;
        this.rewardsForA[recipient] = 0n;
        let [success] = recipient.call({value: amountToWithdraw}); // [SIMULATED: recipient.call.value(amountToWithdraw)("")]
        if (!success) throw new Error("");
    }

    getFirstWithdrawalBonus(recipient, msg_sender, msg_value) {
        if (!(!this.claimedBonus[recipient])) throw new Error(""); // Each recipient should only be able to claim the bonus once

        this.rewardsForA[recipient] = (this.rewardsForA[recipient] || 0n) + 100n;
        //
        this.withdrawReward(recipient, msg_sender, msg_value); // At this point, the caller will be able to execute getFirstWithdrawalBonus again.
        this.claimedBonus[recipient] = true;
    }
}