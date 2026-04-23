/*


 */

// CryptoRoulette
//
// Guess the number secretly stored in the blockchain and win the whole contract balance!
// A new number is randomly chosen after each try.
// https://www.reddit.com/r/ethdev/comments/7wp363/how_does_this_honeypot_work_it_seems_like_a/
// To play, call the play() method with the guessed number (1-20).  Bet price: 0.1 ether

class CryptoRoulette {
    constructor() {
        this.secretNumber = 0n;
        this.lastPlayed = 0n;
        this.betPrice = 100000000000000000n;
        this.ownerAddr = "";
        this.gamesPlayed = []; // [SIMULATED: Game[]]
        this.gamesPlayedLength = 0n; // [SIMULATED: array length]
        this.balance = 0n;
    }

    // [SIMULATED: CryptoRoulette constructor]
    init(msg_sender) {
        this.ownerAddr = msg_sender;
        this.shuffle();
    }

    shuffle() {
        // randomly set secretNumber with a value between 1 and 20
        this.secretNumber = BigInt(Math.floor(Math.random() * 20)) % 20n + 1n;
    }

    play(number, msg_sender, msg_value) {
        if (!(msg_value >= this.betPrice && number <= 10n)) throw new Error("require failed");
        //
        let game = {}; // [SIMULATED: Uninitialized storage pointer]
        game.player = msg_sender;
        game.number = number;
        this.gamesPlayed[Number(this.gamesPlayedLength)] = game;
        this.gamesPlayedLength += 1n;

        if (number === this.secretNumber) {
            // win!
            // [SIMULATED: msg.sender.transfer(this.balance)]
        }

        this.shuffle();
        this.lastPlayed = BigInt(Math.floor(Date.now() / 1000));
    }

    kill(msg_sender) {
        if (msg_sender === this.ownerAddr && BigInt(Math.floor(Date.now() / 1000)) > this.lastPlayed + 86400n) {
            // [SIMULATED: suicide(msg.sender)]
        }
    }

    fallback() { }
}