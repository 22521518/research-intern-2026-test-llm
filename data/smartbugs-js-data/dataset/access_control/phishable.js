/*



 */

class Phishable {
    owner;

    constructor(_owner) {
        this.owner = _owner;
    }

    fallback(msgValue) {} // collect ether

    withdrawAll(_recipient, txOrigin) {
        //
        if (!(txOrigin === this.owner)) throw new Error();
        _recipient.transfer(this.balance); // [SIMULATED: transfer]
    }
}