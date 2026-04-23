/*



 */

//Single transaction overflow
//Post-transaction effect: overflow escapes to publicly-readable storage

// [SIMULATED: pragma solidity ^0.4.19;]

class IntegerOverflowAdd {
    constructor() {
        this.count = 1n;
    }

    run(input) {
        //
        this.count += input;
    }
}