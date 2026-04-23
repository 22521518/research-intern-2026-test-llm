/*




 */

// [SIMULATED: pragma solidity ^0.4.15]

/// @title Ethereum Lottery Game.

class EtherLotto {

    constructor() {
        // Amount of ether needed for participating in the lottery.
        this.TICKET_AMOUNT = 10n;

        // Fixed amount fee for each lottery game.
        this.FEE_AMOUNT = 1n;

        // Public jackpot that each participant can win (minus fee).
        this.pot = 0n;
    }

    // Lottery constructor sets bank account from the smart-contract owner.
    init(msg_sender) {
        this.bank = msg_sender;
    }

    // Public function for playing lottery. Each time this function
    // is invoked, the sender has an oportunity for winning pot.
    play(msg_sender, msg_value) {

        // Participants must spend some fixed ether before playing lottery.
        if (!(msg_value === this.TICKET_AMOUNT)) throw new Error("assert");

        // Increase pot for each participant.
        this.pot += msg_value;

        // Compute some *almost random* value for selecting winner from current transaction.
        //
        var random = BigInt(sha3(block.timestamp)) % 2n; // [SIMULATED: sha3, block.timestamp]

        // Distribution: 50% of participants will be winners.
        if (random === 0n) {

            // Send fee to bank account.
            // [SIMULATED: bank.transfer(FEE_AMOUNT)]

            // Send jackpot to winner.
            // [SIMULATED: msg.sender.transfer(pot - FEE_AMOUNT)]

            // Restart jackpot.
            this.pot = 0n;
        }
    }

}