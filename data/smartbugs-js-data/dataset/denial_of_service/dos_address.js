/*



 */

class DosGas {
    constructor() {
        this.creditorAddresses = [];
        this.creditorAddressesLength = 0n; // [SIMULATED: array length]
        this.win = false;
    }

    emptyCreditors() {
        //
        if (this.creditorAddressesLength > 1500n) {
            this.creditorAddresses = [];
            this.creditorAddressesLength = 0n;
            this.win = true;
        }
    }

    addCreditors(msg_sender) {
        for (let i = 0n; i < 350n; i++) {
            this.creditorAddresses[Number(this.creditorAddressesLength)] = msg_sender;
            this.creditorAddressesLength = this.creditorAddressesLength + 1n;
        }
        return true;
    }

    iWin() {
        return this.win;
    }

    numberCreditors() {
        return this.creditorAddressesLength;
    }
}