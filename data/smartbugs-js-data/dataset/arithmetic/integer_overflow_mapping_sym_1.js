/*



 */

//Single transaction overflow

// [SIMULATED: pragma solidity ^0.4.11;]

class IntegerOverflowMappingSym1 {
    constructor() {
        this.map = {};
    }

    init(k, v) {
        //
        if (this.map[k] === undefined) this.map[k] = 0n;
        this.map[k] = (this.map[k] - v < 0n) ? (this.map[k] - v + 2n**256n) : (this.map[k] - v);
    }
}