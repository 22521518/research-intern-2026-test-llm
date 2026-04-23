/*



 */

//added pragma version

class Lotto {
    constructor() {
        this.blocksPerRound = 6800n;
        // there are an infinite number of rounds (just like a real lottery that takes place every week). `blocksPerRound` decides how many blocks each round will last. 6800 is around a day.

        this.ticketPrice = 100000000000000000n;
        // the cost of each ticket is .1 ether.

        this.blockReward = 5000000000000000000n;

        this.rounds = {}; // [SIMULATED: mapping(uint => Round)]
        this.buyersLength = {}; // [SIMULATED: tracking array length for rounds]
    }

    getBlocksPerRound() { return this.blocksPerRound; }
    getTicketPrice() { return this.ticketPrice; }
    //accessors for constants

    getRoundIndex(blockNumber) {
        //The round index tells us which round we're on. For example if we're on block 24, we're on round 2. Division in Solidity automatically rounds down, so we don't need to worry about decimals.

        return blockNumber / this.blocksPerRound;
    }

    getIsCashed(roundIndex, subpotIndex) {
        //Determine if a given.

        return this.rounds[roundIndex].isCashed[subpotIndex];
    }


    calculateWinner(roundIndex, subpotIndex, blockNumber, blockHash) {
        //note this function only calculates the winners. It does not do any state changes and therefore does not include various validitiy checks

        var decisionBlockNumber = this.getDecisionBlockNumber(roundIndex, subpotIndex);

        if (decisionBlockNumber > blockNumber)
            return;
        //We can't decided the winner if the round isn't over yet

        var decisionBlockHash = blockHash;
        var winningTicketIndex = decisionBlockHash % this.rounds[roundIndex].ticketsCount;
        //We perform a modulus of the blockhash to determine the winner

        var ticketIndex = 0n;

        for (var buyerIndex = 0n; buyerIndex < this.buyersLength[roundIndex]; buyerIndex++) {
            var buyer = this.rounds[roundIndex].buyers[Number(buyerIndex)];
            ticketIndex += this.rounds[roundIndex].ticketsCountByBuyer[buyer];

            if (ticketIndex > winningTicketIndex) {
                return buyer;
            }
        }
    }

    getDecisionBlockNumber(roundIndex, subpotIndex) {
        return ((roundIndex + 1n) * this.blocksPerRound) + subpotIndex;
    }

    getSubpotsCount(roundIndex) {
        var subpotsCount = this.rounds[roundIndex].pot / this.blockReward;

        if (this.rounds[roundIndex].pot % this.blockReward > 0n)
            subpotsCount++;

        return subpotsCount;
    }

    getSubpot(roundIndex) {
        return this.rounds[roundIndex].pot / this.getSubpotsCount(roundIndex);
    }

    cash(roundIndex, subpotIndex, blockNumber) {

        var subpotsCount = this.getSubpotsCount(roundIndex);

        if (subpotIndex >= subpotsCount)
            return;

        var decisionBlockNumber = this.getDecisionBlockNumber(roundIndex, subpotIndex);

        if (decisionBlockNumber > blockNumber)
            return;

        if (this.rounds[roundIndex].isCashed[subpotIndex])
            return;
        //Subpots can only be cashed once. This is to prevent double payouts

        var winner = this.calculateWinner(roundIndex, subpotIndex, blockNumber, 0n); // [SIMULATED: blockhash]
        var subpot = this.getSubpot(roundIndex);

        //
        // winner.send(subpot); [SIMULATED: send ether]

        this.rounds[roundIndex].isCashed[subpotIndex] = true;
        //Mark the round as cashed
    }

    getHashOfBlock(blockIndex) {
        return 0n; // [SIMULATED: block.blockhash]
    }

    getBuyers(roundIndex, buyer) {
        return this.rounds[roundIndex].buyers;
    }

    getTicketsCountByBuyer(roundIndex, buyer) {
        return this.rounds[roundIndex].ticketsCountByBuyer[buyer];
    }

    getPot(roundIndex) {
        return this.rounds[roundIndex].pot;
    }

    fallback(msgSender, msgValue, blockNumber) {
        //this is the function that gets called when people send money to the contract.

        var roundIndex = this.getRoundIndex(blockNumber);
        var value = msgValue - (msgValue % this.ticketPrice);

        if (value == 0n) return;

        if (value < msgValue) {
            //
            // msgSender.send(msgValue - value); [SIMULATED: send ether]
        }
        //no partial tickets, send a partial refund

        var ticketsCount = value / this.ticketPrice;
        this.rounds[roundIndex].ticketsCount += ticketsCount;

        if (this.rounds[roundIndex].ticketsCountByBuyer[msgSender] == 0n) {
            var buyersLength = this.buyersLength[roundIndex]++;
            this.rounds[roundIndex].buyers[Number(buyersLength)] = msgSender;
        }

        this.rounds[roundIndex].ticketsCountByBuyer[msgSender] += ticketsCount;
        this.rounds[roundIndex].ticketsCount += ticketsCount;
        //keep track of the total tickets

        this.rounds[roundIndex].pot += value;
        //keep track of the total pot

    }

}