/*



 */

//Multi-transactional, single function
//Arithmetic instruction reachable

// [SIMULATED: pragma solidity ^0.4.23;]

class IntegerOverflowMultiTxOneFuncFeasible {
    constructor() {
        this.initialized = 0n;
        this.count = 1n;
    }

    run(input, msg_sender, msg_value) {
        if (this.initialized === 0n) {
            this.initialized = 1n;
            return;
        }
        //
        this.count -= input;
        if (this.count < 0n) {
            this.count = (2n ** 256n) + this.count;
        }
    }
}