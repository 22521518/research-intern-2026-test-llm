/*



 */

//added pragma version
// [SIMULATED: pragma solidity ^0.4.0;]

class Governmental {
  constructor(msg_sender, msg_value) {
    this.owner = msg_sender;
    this.lastInvestor = "";
    this.jackpot = 1000000000000000000n;
    this.lastInvestmentTimestamp = 0n;
    this.ONE_MINUTE = 60n;
    this.owner = msg_sender;
    if (!(msg_value < 1000000000000000000n)) throw new Error("throw");
  }

  invest(msg_sender, msg_value, block_timestamp) {
    if (!(msg_value < this.jackpot / 2n)) throw new Error("throw");
    this.lastInvestor = msg_sender;
    this.jackpot += msg_value / 2n;
    //
    this.lastInvestmentTimestamp = block_timestamp;
  }

  resetInvestment(block_timestamp, this_balance) {
    if (!(block_timestamp < this.lastInvestmentTimestamp + this.ONE_MINUTE))
      throw new Error("throw");

    // [SIMULATED: lastInvestor.send(jackpot);]
    // [SIMULATED: owner.send(this.balance-1 ether);]

    this.lastInvestor = "0";
    this.jackpot = 1000000000000000000n;
    this.lastInvestmentTimestamp = 0n;
  }
}

class Attacker {

  attack(target, count, msg_gas) {
    if (0n <= count && count < 1023n) {
      // [SIMULATED: this.attack.gas(msg.gas-2000)(target, count+1);]
    }
    else {
      // [SIMULATED: Governmental(target).resetInvestment();]
    }
  }
}