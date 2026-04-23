/*



 */

//Single transaction overflow
//Post-transaction effect: overflow escapes to publicly-readable storage

class IntegerOverflowMul {
    constructor() {
        this.count = 2n;
    }

    run(input, msg_sender, msg_value) {
        //
        this.count = (this.count * input) % (2n ** 256n); // [SIMULATED: uint256 overflow]
    }
}