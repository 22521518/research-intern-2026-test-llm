/*



 */

class EthTxOrderDependenceMinimal {
    constructor() {
        this.owner = ""; // [SIMULATED: address]
        this.claimed = false;
        this.reward = 0n;
    }

    EthTxOrderDependenceMinimal(msg_sender) {
        this.owner = msg_sender;
    }

    setReward(msg_sender, msg_value) {
        if (!(!this.claimed)) throw new Error("require");

        if (!(msg_sender == this.owner)) throw new Error("require");
        //
        // [SIMULATED: owner.transfer(reward)]
        this.reward = msg_value;
    }

    claimReward(submission, msg_sender) {
        if (!(!this.claimed)) throw new Error("require");
        if (!(submission < 10n)) throw new Error("require");
        //
        // [SIMULATED: msg.sender.transfer(reward)]
        this.claimed = true;
    }
}