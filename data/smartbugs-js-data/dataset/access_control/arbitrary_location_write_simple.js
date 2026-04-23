/*



 */

class Wallet {
    bonusCodes = [];
    bonusCodesLength = 0n;
    owner = "";

    constructor(msg_sender) {
        this.bonusCodes = [];
        this.bonusCodesLength = 0n;
        this.owner = msg_sender;
    }

    receive(msg_sender, msg_value) {
    }

    PushBonusCode(c) {
        this.bonusCodes.push(c);
        this.bonusCodesLength += 1n;
    }

    PopBonusCode() {
        //
        if (!(0n <= this.bonusCodesLength)) throw new Error(); // this condition is always true since array lengths are unsigned
        this.bonusCodesLength = (this.bonusCodesLength === 0n) ? 2n**256n - 1n : this.bonusCodesLength - 1n; // an underflow can be caused here
    }

    UpdateBonusCodeAt(idx, c) {
        if (!(idx < this.bonusCodesLength)) throw new Error();
        this.bonusCodes[Number(idx)] = c; // write to any index less than bonusCodes.length
    }

    Destroy(msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error();
        // [SIMULATED: selfdestruct(msg_sender)]
    }
}