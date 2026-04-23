/*



 */

//Multi-transactional, multi-function
//Arithmetic instruction reachable

// [SIMULATED: pragma solidity ^0.4.23;]

class IntegerOverflowMultiTxMultiFuncFeasible {
    constructor() {
        this.initialized = 0n;
        this.count = 1n;
    }

    init() {
        this.initialized = 1n;
    }

    run(input) {
        if (this.initialized === 0n) {
            return;
        }
        //
        this.count = (this.count - input < 0n) ? (this.count - input + 2n**256n) : (this.count - input);
    }
}