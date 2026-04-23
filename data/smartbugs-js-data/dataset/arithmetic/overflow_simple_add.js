/*



 */

// [SIMULATED: pragma solidity 0.4.25;]

class Overflow_Add {
    constructor() {
        this.balance = 1n;
    }

    add(deposit) {
        //
        this.balance += deposit;
    }
}