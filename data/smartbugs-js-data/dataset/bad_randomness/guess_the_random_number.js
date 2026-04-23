/*



 */

class GuessTheRandomNumberChallenge {
    constructor() {
        this.answer = 0n; // [SIMULATED: uint8]
        this.balance = 0n; // [SIMULATED: address(this).balance]
    }

    GuessTheRandomNumberChallenge(msg_value) {
        if (!(msg_value === 1000000000000000000n)) throw new Error("require");
        //
        this.answer = BigInt(keccak256(block.blockhash(block.number - 1n), now)); // [SIMULATED: uint8 cast]
    }

    isComplete() {
        return this.balance === 0n;
    }

    guess(n, msg_sender, msg_value) {
        if (!(msg_value === 1000000000000000000n)) throw new Error("require");

        if (n === this.answer) {
            // [SIMULATED: msg.sender.transfer(2 ether)]
            this.balance -= 2000000000000000000n;
        }
    }
}