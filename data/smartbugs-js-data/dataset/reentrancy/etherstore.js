/*



 */

//added pragma version
// [SIMULATED: pragma solidity ^0.4.10]

class EtherStore {
    constructor() {
        this.withdrawalLimit = 1000000000000000000n;
        this.lastWithdrawTime = {};
        this.balances = {};
    }

    depositFunds(msg_sender, msg_value) {
        this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
    }

    withdrawFunds(msg_sender, _weiToWithdraw, now) {
        if (!( (this.balances[msg_sender] || 0n) >= _weiToWithdraw)) throw new Error("require");
        // limit the withdrawal
        if (!(_weiToWithdraw <= this.withdrawalLimit)) throw new Error("require");
        // limit the time allowed to withdraw
        if (!(now >= (this.lastWithdrawTime[msg_sender] || 0n) + 604800n)) throw new Error("require");
        //
        if (!(true)) throw new Error("require"); // [SIMULATED: msg.sender.call.value(_weiToWithdraw)()]
        this.balances[msg_sender] = (this.balances[msg_sender] || 0n) - _weiToWithdraw;
        if (this.balances[msg_sender] < 0n) this.balances[msg_sender] = (2n**256n) + this.balances[msg_sender];
        this.lastWithdrawTime[msg_sender] = now;
    }
}