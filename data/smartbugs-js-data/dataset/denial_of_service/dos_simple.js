/*



 */


// [SIMULATED: pragma solidity ^0.4.25;]

class DosOneFunc {

    constructor() {
        this.listAddresses = [];
        this.listAddresses_length = 0n; // [SIMULATED: array length tracking]
    }

    ifillArray(msg_sender) {
        if(this.listAddresses_length < 150n) { // [SIMULATED: 1500n]
            //
            for(let i = 0n; i < 350n; i++) {
                this.listAddresses[Number(this.listAddresses_length)] = msg_sender;
                this.listAddresses_length++;
            }
            return true;

        } else {
            this.listAddresses = [];
            this.listAddresses_length = 0n;
            return false;
        }
    }
}