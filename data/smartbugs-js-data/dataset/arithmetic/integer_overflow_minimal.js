/*



 */

//Single transaction overflow
//Post-transaction effect: overflow escapes to publicly-readable storage

// [SIMULATED: pragma solidity ^0.4.19;]

class IntegerOverflowMinimal {
    constructor() {
        this.count = 1n;
    }

    run(input) {
        //
        this.count -= input;
        if (this.count < 0n) {
            this.count = (2n ** 256n - 1n) + (this.count % (2n ** 256n)) + 1n;
        }
    }
}