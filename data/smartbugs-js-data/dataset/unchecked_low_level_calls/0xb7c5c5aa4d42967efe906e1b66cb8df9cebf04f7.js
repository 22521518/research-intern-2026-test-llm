/*



 */

/*
!!! THIS CONTRACT IS EXPLOITABLE AND FOR EDUCATIONAL PURPOSES ONLY !!!

This smart contract allows a user to (insecurely) store funds
in this smart contract and withdraw them at any later point in time
*/

class keepMyEther {
    constructor() {
        this.balances = {}; // [SIMULATED: mapping]
    }

    function_fallback(msg_sender, msg_value) {
        this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
    }

    withdraw(msg_sender) {
        //
        msg_sender.call({value: this.balances[msg_sender]}); // [SIMULATED: low-level call]
        this.balances[msg_sender] = 0n;
    }
}