/*



 */

//Single transaction overflow
//Post-transaction effect: overflow never escapes function

// [SIMULATED: pragma solidity ^0.4.19;]

class IntegerOverflowBenign1 {
    constructor() {
        this.count = 1n;
    }

    run(input) {
        //
        let res = this.count - input;
        if (res < 0n) {
            res = (2n ** 256n - 1n) + (res % (2n ** 256n)) + 1n;
        }
    }
}