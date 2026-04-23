/*



 */

//added pragma version
 // [SIMULATED: pragma solidity ^0.4.10;]
 
 class TimeLock {
     constructor() {
         this.balances = {};
         this.lockTime = {};
     }

     deposit(msg_sender, msg_value) {
         this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
         this.lockTime[msg_sender] = BigInt(Math.floor(Date.now() / 1000)) + 604800n;
     }

     increaseLockTime(msg_sender, _secondsToIncrease) {
         //
         this.lockTime[msg_sender] = (this.lockTime[msg_sender] || 0n) + _secondsToIncrease;
     }

     withdraw(msg_sender) {
         if (!( (this.balances[msg_sender] || 0n) > 0n)) throw new Error("require");
         if (!( BigInt(Math.floor(Date.now() / 1000)) > (this.lockTime[msg_sender] || 0n))) throw new Error("require");
         let transferValue = (this.balances[msg_sender] || 0n);
         this.balances[msg_sender] = 0n;
         // [SIMULATED: msg.sender.transfer(transferValue);]
     }
 }