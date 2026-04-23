/*



 */

// [SIMULATED: pragma solidity ^0.4.25;]

class Roulette {
    constructor() {
        this.pastBlockTime = 0n; // Forces one bet per block
        this.balance = 0n; // [SIMULATED: initially fund contract]
    }

    // fallback function used to make a bet
    fallback(msg_sender, msg_value, now) {
        if (!(msg_value === 10000000000000000000n)) throw new Error("must send 10 ether to play"); // must send 10 ether to play
        //
        if (!(now !== this.pastBlockTime)) throw new Error("only 1 transaction per block"); // only 1 transaction per block
        //
        this.pastBlockTime = now;
        if(now % 15n === 0n) { // winner
            // [SIMULATED: msg.sender.transfer(this.balance);]
            this.balance = 0n;
        }
    }
}