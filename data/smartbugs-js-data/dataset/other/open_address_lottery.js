/*


 */

/*
 * This is a distributed lottery that chooses random addresses as lucky addresses. If these
 * participate, they get the jackpot: 7 times the price of their bet.
 * Of course one address can only win once. The owner regularly reseeds the secret
 * seed of the contract (based on which the lucky addresses are chosen), so if you did not win,
 * just wait for a reseed and try again!
 *
 * Jackpot chance:   1 in 8
 * Ticket price: Anything larger than (or equal to) 0.1 ETH
 * Jackpot size: 7 times the ticket price
 *
 * HOW TO PARTICIPATE: Just send any amount greater than (or equal to) 0.1 ETH to the contract's address
 * Keep in mind that your address can only win once
 *
 * If the contract doesn't have enough ETH to pay the jackpot, it sends the whole balance.

 https://www.reddit.com/r/ethdev/comments/7wp363/how_does_this_honeypot_work_it_seems_like_a/
*/

class OpenAddressLottery {
    constructor() {
        this.owner = ""; // [SIMULATED: address]
        this.secretSeed = 0n;
        this.lastReseed = 0n;
        this.LuckyNumber = 7n;
        this.winner = {}; // [SIMULATED: mapping]
    }

    // [SIMULATED: constructor]
    init(msg_sender, block_coinbase, block_difficulty, block_gaslimit, block_timestamp) {
        this.owner = msg_sender;
        this.reseed({
            component1: BigInt(block_coinbase),
            component2: block_difficulty,
            component3: block_gaslimit,
            component4: block_timestamp
        });
    }

    participate(msg_sender, msg_value, block_number, block_coinbase, block_difficulty, block_gaslimit, block_timestamp, contract_balance) {
        if (msg_value < 100000000000000000n)
            return; //verify ticket price

        // make sure he hasn't won already
        if (!(this.winner[msg_sender] == false)) throw new Error("require failed");

        if (this.luckyNumberOfAddress(msg_sender, this.secretSeed) == this.LuckyNumber) { //check if it equals 7
            this.winner[msg_sender] = true; // every address can only win once

            let win = msg_value * 7n; //win = 7 times the ticket price

            if (win > contract_balance) //if the balance isnt sufficient...
                win = contract_balance; //...send everything we've got
            // [SIMULATED: msg.sender.transfer(win)]
        }

        if (block_number - this.lastReseed > 1000n) //reseed if needed
            this.reseed({
                component1: BigInt(block_coinbase),
                component2: block_difficulty,
                component3: block_gaslimit,
                component4: block_timestamp
            }); //generate a quality random seed
    }

    luckyNumberOfAddress(addr, secretSeed) {
        // calculate the number of current address - 1 in 8 chance
        // [SIMULATED: keccak256]
        let n = BigInt(0n) % 8n;
        return n;
    }

    reseed(components) {
        this.secretSeed = BigInt(0n); // [SIMULATED: keccak256]
        this.lastReseed = 0n; // [SIMULATED: block.number]
    }

    kill(msg_sender) {
        if (!(msg_sender == this.owner)) throw new Error("require failed");

        // [SIMULATED: selfdestruct(msg.sender)]
    }

    forceReseed(msg_sender, block_number, block_coinbase, block_difficulty, tx_gasprice) { //reseed initiated by the owner - for testing purposes
        if (!(msg_sender == this.owner)) throw new Error("require failed");
        //
        let s = { component1: 0n, component2: 0n, component3: 0n, component4: 0n };
        s.component1 = BigInt(msg_sender);
        s.component2 = 0n; // [SIMULATED: block.blockhash]
        s.component3 = block_difficulty * BigInt(block_coinbase);
        s.component4 = tx_gasprice * 7n;

        this.reseed(s); //reseed
    }

    fallback(msg_sender, msg_value) { //if someone sends money without any function call, just assume he wanted to participate
        if (msg_value >= 100000000000000000n && msg_sender != this.owner) //owner can't participate, he can only fund the jackpot
            this.participate();
    }
}