/*




 */

// [SIMULATED: pragma solidity 0.4.24;]

class Refunder {
    
    constructor() {
        this.refundAddresses = [];
        this.refunds = {}; // [SIMULATED: mapping]
        this.refundAddresses.push("0x79B483371E87d664cd39491b5F06250165e4b184");
        this.refundAddresses.push("0x79B483371E87d664cd39491b5F06250165e4b185");
    }

    // bad
    refundAll() {
        for(let x = 0n; x < BigInt(this.refundAddresses.length); x++) { // arbitrary length iteration based on how many addresses participated
        //
            if (!this.refundAddresses[Number(x)].send(this.refunds[this.refundAddresses[Number(x)]])) throw new Error("require"); // doubly bad, now a single failure on send will hold up all funds
        }
    }

}