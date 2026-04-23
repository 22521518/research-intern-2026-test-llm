/*



 */


// [SIMULATED: pragma solidity ^0.4.24;]
class Missing {
    constructor() {
        this.owner = ""; // [SIMULATED: address private owner;]
        this.balance = 0n; // [SIMULATED: contract balance]
    }

    // [SIMULATED: modifier onlyowner]
    
    //
    missing(msg_sender)
    {
        this.owner = msg_sender;
    }

    // [SIMULATED: function () payable {}]
    fallback(msg_value) {
        this.balance += msg_value;
    }

    withdraw(msg_sender)
    {
        if (!(msg_sender == this.owner)) throw new Error("require");
        
        // [SIMULATED: owner.transfer(this.balance);]
        this.balance = 0n;
    }
}