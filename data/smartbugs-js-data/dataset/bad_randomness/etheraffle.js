/*




 */

class Ethraffle_v4b {
    constructor(msg_sender) {
        this.feeAddress = msg_sender;
    }

    // Constants
    prize = 2500000000000000000n;
    fee = 30000000000000000n;
    totalTickets = 50n;
    pricePerTicket = (this.prize + this.fee) / this.totalTickets; // Make sure this divides evenly
    feeAddress;

    // Other internal variables
    paused = false;
    raffleId = 1n;
    //
    blockNumber = BigInt(block.number); // [SIMULATED: block.number]
    nextTicket = 0n;
    contestants = {}; // [SIMULATED: mapping]
    gaps = [];
    gaps_length = 0n; // [SIMULATED: array length tracking]

    // Initialization
    // function Ethraffle_v4b() public { ... } // [SIMULATED: constructor]

    // Call buyTickets() when receiving Ether outside a function
    fallback(msg_sender, msg_value) {
        this.buyTickets(msg_sender, msg_value);
    }

    buyTickets(msg_sender, msg_value) {
        if (this.paused) {
            // msg.sender.transfer(msg.value); // [SIMULATED: transfer]
            return;
        }

        let moneySent = msg_value;

        while (moneySent >= this.pricePerTicket && this.nextTicket < this.totalTickets) {
            let currTicket = 0n;
            if (this.gaps_length > 0n) {
                currTicket = this.gaps[Number(this.gaps_length - 1n)];
                if (this.gaps_length === 0n) { this.gaps_length = 115792089237316195423570985008687907853269984665640564039457584007913129639935n; } else { this.gaps_length--; }
            } else {
                currTicket = this.nextTicket++;
            }

            this.contestants[Number(currTicket)] = { addr: msg_sender, raffleId: this.raffleId };
            console.log("TicketPurchase", this.raffleId, msg_sender, currTicket);
            moneySent -= this.pricePerTicket;
        }

        // Choose winner if we sold all the tickets
        if (this.nextTicket === this.totalTickets) {
            this.chooseWinner(msg_sender);
        }

        // Send back leftover money
        if (moneySent > 0n) {
            // msg.sender.transfer(moneySent); // [SIMULATED: transfer]
        }
    }

    chooseWinner(msg_sender) {
        //
        let seed1 = this.contestants[Number(BigInt(block.coinbase) % this.totalTickets)].addr; // [SIMULATED: block.coinbase]
        //
        let seed2 = this.contestants[Number(BigInt(msg_sender) % this.totalTickets)].addr;
        //
        let seed3 = BigInt(block.difficulty); // [SIMULATED: block.difficulty]
        let randHash = keccak256(seed1, seed2, seed3); // [SIMULATED: keccak256]

        let winningNumber = BigInt(randHash) % this.totalTickets;
        let winningAddress = this.contestants[Number(winningNumber)].addr;
        console.log("RaffleResult", this.raffleId, winningNumber, winningAddress, seed1, seed2, seed3, randHash);

        // Start next raffle
        this.raffleId++;
        this.nextTicket = 0n;
        //
        this.blockNumber = BigInt(block.number); // [SIMULATED: block.number]

        // gaps.length = 0 isn't necessary here,
        // because buyTickets() eventually clears
        // the gaps array in the loop itself.

        // Distribute prize and fee
        // winningAddress.transfer(prize); // [SIMULATED: transfer]
        // feeAddress.transfer(fee); // [SIMULATED: transfer]
    }

    // Get your money back before the raffle occurs
    getRefund(msg_sender) {
        let refund = 0n;
        for (let i = 0n; i < this.totalTickets; i++) {
            if (msg_sender === this.contestants[Number(i)].addr && this.raffleId === this.contestants[Number(i)].raffleId) {
                refund += this.pricePerTicket;
                this.contestants[Number(i)] = { addr: "0x0000000000000000000000000000000000000000", raffleId: 0n };
                this.gaps.push(i);
                this.gaps_length++;
                console.log("TicketRefund", this.raffleId, msg_sender, i);
            }
        }

        if (refund > 0n) {
            // msg.sender.transfer(refund); // [SIMULATED: transfer]
        }
    }

    // Refund everyone's money, start a new raffle, then pause it
    endRaffle(msg_sender) {
        if (msg_sender === this.feeAddress) {
            this.paused = true;

            for (let i = 0n; i < this.totalTickets; i++) {
                if (this.raffleId === this.contestants[Number(i)].raffleId) {
                    console.log("TicketRefund", this.raffleId, this.contestants[Number(i)].addr, i);
                    // contestants[i].addr.transfer(pricePerTicket); // [SIMULATED: transfer]
                }
            }

            console.log("RaffleResult", this.raffleId, this.totalTickets, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000", 0n, 0n);
            this.raffleId++;
            this.nextTicket = 0n;
            //
            this.blockNumber = BigInt(block.number); // [SIMULATED: block.number]
            this.gaps_length = 0n;
        }
    }

    togglePause(msg_sender) {
        if (msg_sender === this.feeAddress) {
            this.paused = !this.paused;
        }
    }

    kill(msg_sender) {
        if (msg_sender === this.feeAddress) {
            // selfdestruct(feeAddress); // [SIMULATED: selfdestruct]
        }
    }
}