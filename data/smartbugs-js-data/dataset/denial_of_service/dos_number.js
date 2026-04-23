/*



 */

class DosNumber {
    constructor() {
        this.numElements = 0n;
        this.array = []; // [SIMULATED: uint[]]
        this.arrayLength = 0n; // [SIMULATED: array.length]
    }

    insertNnumbers(value, numbers) {

        // Gas DOS if number > 382 more or less, it depends on actual gas limit
        //
        for(let i = 0n; i < numbers; i++) {
            if(this.numElements == this.arrayLength) {
                this.arrayLength += 1n;
            }
            this.array[Number(this.numElements++)] = value;
        }
    }

    clear() {
        if (!(this.numElements > 1500n)) throw new Error("require");
        this.numElements = 0n;
    }

    // Gas DOS clear
    clearDOS() {

        // number depends on actual gas limit
        if (!(this.numElements > 1500n)) throw new Error("require");
        this.array = [];
        this.arrayLength = 0n;
        this.numElements = 0n;
    }

    getLengthArray() {
        return this.numElements;
    }

    getRealLengthArray() {
        return this.arrayLength;
    }
}