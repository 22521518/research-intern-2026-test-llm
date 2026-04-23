/*



 */

//Single transaction overflow
//Post-transaction effect: overflow escapes to publicly-readable storage

class IntegerOverflowSingleTransaction {
    constructor() {
        this.count = 1n;
    }

    // ADD overflow with result stored in state variable.
    overflowaddtostate(input) {
        //
        this.count += input;
    }

    // MUL overflow with result stored in state variable.
    overflowmultostate(input) {
        //
        this.count *= input;
    }

    // Underflow with result stored in state variable.
    underflowtostate(input) {
        //
        if (this.count < input) {
            this.count = (2n ** 256n) - (input - this.count);
        } else {
            this.count -= input;
        }
    }

    // ADD Overflow, no effect on state.
    overflowlocalonly(input) {
        //
        let res = this.count + input;
    }

    // MUL Overflow, no effect on state.
    overflowmulocalonly(input) {
        //
        let res = this.count * input;
    }

    // Underflow, no effect on state.
    underflowlocalonly(input) {
        //
       	let res = this.count - input;
    }

}