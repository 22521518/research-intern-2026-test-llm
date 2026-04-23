/*



 */

//Based on the the Capture the Ether challange at https://capturetheether.com/challenges/lotteries/predict-the-block-hash/
//Note that while it seems to have a 1/2^256 chance you guess the right hash, actually blockhash returns zero for blocks numbers that are more than 256 blocks ago so you can guess zero and wait.
class PredictTheBlockHashChallenge {

    constructor(msg_value) {
        if (!(msg_value === 1000000000000000000n)) throw new Error("require(msg.value == 1 ether)");
    }

    // [SIMULATED: struct guess]
    // [SIMULATED: mapping(address => guess) guesses]
    guesses = {};

    lockInGuess(hash, msg_sender, msg_value, block_number) {
        if (!(this.guesses[msg_sender].block === 0n)) throw new Error("require(guesses[msg.sender].block == 0)");
        if (!(msg_value === 1000000000000000000n)) throw new Error("require(msg.value == 1 ether)");

        this.guesses[msg_sender].guess = hash;
        this.guesses[msg_sender].block = block_number + 1n;
    }

    settle(msg_sender, block_number) {
        if (!(block_number > this.guesses[msg_sender].block)) throw new Error("require(block.number > guesses[msg.sender].block)");
        //
        let answer = blockhash(this.guesses[msg_sender].block); // [SIMULATED: blockhash]

        this.guesses[msg_sender].block = 0n;
        if (this.guesses[msg_sender].guess === answer) {
            msg_sender.transfer(2000000000000000000n); // [SIMULATED: transfer]
        }
    }
}