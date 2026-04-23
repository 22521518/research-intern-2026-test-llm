/*



 */

class Reentrance {
    constructor() {
        this.userBalance = {}; // [SIMULATED: mapping]
    }

    getBalance(u) {
        return this.userBalance[u];
    }

    addToBalance(msg_sender, msg_value) {
        this.userBalance[msg_sender] = (this.userBalance[msg_sender] || 0n) + msg_value;
    }

    withdrawBalance(msg_sender) {
        // send userBalance[msg.sender] ethers to msg.sender
        // if mgs.sender is a contract, it will call its fallback function
        //
        if (!(msg_sender.call.value(this.userBalance[msg_sender])())) {
            throw new Error();
        }
        this.userBalance[msg_sender] = 0n;
    }
}