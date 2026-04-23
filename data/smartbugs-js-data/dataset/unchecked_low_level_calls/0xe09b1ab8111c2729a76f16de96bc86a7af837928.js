/*



 */

class FiftyFlip {
    constructor(whaleAddress, autoPlayBotAddress, secretSignerAddress, msgSender) {
        this.DONATING_X = 20n;
        this.JACKPOT_FEE = 10n;
        this.JACKPOT_MODULO = 1000n;
        this.DEV_FEE = 20n;
        this.WIN_X = 1900n;
        this.MIN_BET = 10000000000000000n;
        this.MAX_BET = 1000000000000000000n;
        this.BET_EXPIRATION_BLOCKS = 250n;
        this.owner = msgSender;
        this.autoPlayBot = autoPlayBotAddress;
        this.secretSigner = secretSignerAddress;
        this.whale = whaleAddress;
        this.jackpotSize = 0n;
        this.devFeeSize = 0n;
        this.lockedInBets = 0n;
        this.totalAmountToWhale = 0n;
        this.bets = {}; // [SIMULATED: mapping]
        this.donateAmount = {}; // [SIMULATED: mapping]
        this.balance = 0n; // [SIMULATED: address(this).balance]
    }

    setBotAddress(autoPlayBotAddress, msgSender) {
        if (!(msgSender === this.owner)) throw new Error("You are not the owner of this contract!");
        this.autoPlayBot = autoPlayBotAddress;
    }

    setSecretSigner(_secretSigner, msgSender) {
        if (!(msgSender === this.owner)) throw new Error("You are not the owner of this contract!");
        this.secretSigner = _secretSigner;
    }

    wager(bMask, ticketID, ticketLastBlock, v, r, s, msgValue, msgSender, blockNumber) {
        if (!(this.balance >= this.lockedInBets + this.jackpotSize + this.devFeeSize)) throw new Error("This contract doesn't have enough balance, it is stopped till someone donate to this game!");
        let bet = this.bets[Number(ticketID)] || { amount: 0n, blockNumber: 0n, betMask: false, player: "0x0000000000000000000000000000000000000000" };
        let amount = msgValue;
        let player = msgSender;
        if (!(bet.player === "0x0000000000000000000000000000000000000000")) throw new Error("Ticket is not new one!");
        if (!(amount >= this.MIN_BET)) throw new Error("Your bet is lower than minimum bet amount");
        if (!(amount <= this.MAX_BET)) throw new Error("Your bet is higher than maximum bet amount");
        if (!(this.getCollateralBalance() >= 2n * amount)) throw new Error("If we accept this, this contract will be in danger!");
        if (!(BigInt(blockNumber) <= ticketLastBlock)) throw new Error("Ticket has expired.");
        let signatureHash = keccak256(abi.encodePacked('\x19Ethereum Signed Message:\n37', BigInt(ticketLastBlock), ticketID));
        if (!(this.secretSigner === ecrecover(signatureHash, v, r, s))) throw new Error("web3 vrs signature is not valid.");
        this.jackpotSize += amount * this.JACKPOT_FEE / 1000n;
        this.devFeeSize += amount * this.DEV_FEE / 1000n;
        this.lockedInBets += amount * this.WIN_X / 1000n;
        let donate_amount = amount * this.DONATING_X / 1000n;
        this.whale.call.value(donate_amount)(bytes4(keccak256("donate()")));
        this.totalAmountToWhale += donate_amount;
        bet.amount = amount;
        bet.blockNumber = BigInt(blockNumber);
        bet.betMask = bMask;
        bet.player = player;
        this.bets[Number(ticketID)] = bet;
        console.log("Wager", ticketID, bet.amount, bet.blockNumber, bet.betMask, bet.player);
    }

    play(ticketReveal, blockNumber) {
        if (!(this.balance >= this.lockedInBets + this.jackpotSize + this.devFeeSize)) throw new Error("This contract doesn't have enough balance, it is stopped till someone donate to this game!");
        let ticketID = BigInt(keccak256(abi.encodePacked(ticketReveal)));
        let bet = this.bets[Number(ticketID)];
        if (!(bet.player !== "0x0000000000000000000000000000000000000000")) throw new Error("TicketID is not correct!");
        if (!(bet.amount !== 0n)) throw new Error("Ticket is already used one!");
        let blockNumber_ = bet.blockNumber;
        if (blockNumber_ < BigInt(blockNumber) && blockNumber_ >= BigInt(blockNumber) - this.BET_EXPIRATION_BLOCKS) {
            let random = BigInt(keccak256(abi.encodePacked(blockhash(blockNumber_), ticketReveal)));
            let maskRes = (random % 2n) !== 0n;
            let jackpotRes = random % this.JACKPOT_MODULO;
            let tossWinAmount = bet.amount * this.WIN_X / 1000n;
            let tossWin = 0n;
            let jackpotWin = 0n;
            if (bet.betMask === maskRes) {
                tossWin = tossWinAmount;
            }
            if (jackpotRes === 0n) {
                jackpotWin = this.jackpotSize;
                this.jackpotSize = 0n;
            }
            if (jackpotWin > 0n) {
                console.log("JackpotPayment", bet.player, ticketID, jackpotWin);
            }
            if (tossWin + jackpotWin > 0n) {
                this.payout(bet.player, tossWin + jackpotWin, ticketID, maskRes, jackpotRes);
            } else {
                this.loseWager(bet.player, bet.amount, ticketID, maskRes, jackpotRes);
            }
            this.lockedInBets -= tossWinAmount;
            bet.amount = 0n;
            this.bets[Number(ticketID)] = bet;
        } else {
            throw new Error();
        }
    }

    donateForContractHealth(msgValue, msgSender) {
        this.donateAmount[msgSender] = (this.donateAmount[msgSender] || 0n) + msgValue;
        console.log("Donate", msgValue, msgSender);
    }

    withdrawDonation(amount, msgSender) {
        if (!(this.donateAmount[msgSender] >= amount)) throw new Error("You are going to withdraw more than you donated!");
        if (this.sendFunds(msgSender, amount)) {
            this.donateAmount[msgSender] -= amount;
        }
    }

    refund(ticketID, blockNumber) {
        if (!(this.balance >= this.lockedInBets + this.jackpotSize + this.devFeeSize)) throw new Error("This contract doesn't have enough balance, it is stopped till someone donate to this game!");
        let bet = this.bets[Number(ticketID)];
        if (!(bet.amount !== 0n)) throw new Error("this ticket has no balance");
        if (!(BigInt(blockNumber) > bet.blockNumber + this.BET_EXPIRATION_BLOCKS)) throw new Error("this ticket is expired.");
        this.sendRefund(ticketID);
    }

    withdrawDevFee(withdrawAddress, withdrawAmount, msgSender, blockNumber) {
        if (!(msgSender === this.owner)) throw new Error("You are not the owner of this contract!");
        if (!(this.balance >= this.lockedInBets + this.jackpotSize + this.devFeeSize)) throw new Error("This contract doesn't have enough balance, it is stopped till someone donate to this game!");
        if (!(this.devFeeSize >= withdrawAmount)) throw new Error("You are trying to withdraw more amount than developer fee.");
        if (!(withdrawAmount <= this.balance)) throw new Error("Contract balance is lower than withdrawAmount");
        if (!(this.devFeeSize <= this.balance)) throw new Error("Not enough funds to withdraw.");
        if (this.sendFunds(withdrawAddress, withdrawAmount)) {
            this.devFeeSize -= withdrawAmount;
        }
    }

    withdrawBotFee(withdrawAmount, msgSender, blockNumber) {
        if (!(msgSender === this.autoPlayBot)) throw new Error("You are not the bot of this contract!");
        if (!(this.balance >= this.lockedInBets + this.jackpotSize + this.devFeeSize)) throw new Error("This contract doesn't have enough balance, it is stopped till someone donate to this game!");
        if (!(this.devFeeSize >= withdrawAmount)) throw new Error("You are trying to withdraw more amount than developer fee.");
        if (!(withdrawAmount <= this.balance)) throw new Error("Contract balance is lower than withdrawAmount");
        if (!(this.devFeeSize <= this.balance)) throw new Error("Not enough funds to withdraw.");
        if (this.sendFunds(this.autoPlayBot, withdrawAmount)) {
            this.devFeeSize -= withdrawAmount;
        }
    }

    getBetInfo(ticketID) {
        let bet = this.bets[Number(ticketID)];
        return [bet.amount, bet.blockNumber, bet.betMask, bet.player];
    }

    getContractBalance() {
        return this.balance;
    }

    getCollateralBalance() {
        if (this.balance > this.lockedInBets + this.jackpotSize + this.devFeeSize)
            return this.balance - this.lockedInBets - this.jackpotSize - this.devFeeSize;
        return 0n;
    }

    kill(msgSender) {
        if (!(msgSender === this.owner)) throw new Error("You are not the owner of this contract!");
        if (!(this.lockedInBets === 0n)) throw new Error("All bets should be processed (settled or refunded) before self-destruct.");
        // [SIMULATED: selfdestruct(owner)]
    }

    payout(winner, ethToTransfer, ticketID, maskRes, jackpotRes) {
        // [SIMULATED: winner.transfer(ethToTransfer)]
        console.log("Win", winner, ethToTransfer, ticketID, maskRes, jackpotRes);
    }

    sendRefund(ticketID) {
        let bet = this.bets[Number(ticketID)];
        let requester = bet.player;
        let ethToTransfer = bet.amount;
        // [SIMULATED: requester.transfer(ethToTransfer)]
        let tossWinAmount = bet.amount * this.WIN_X / 1000n;
        this.lockedInBets -= tossWinAmount;
        bet.amount = 0n;
        this.bets[Number(ticketID)] = bet;
        console.log("Refund", ticketID, ethToTransfer, requester);
    }

    sendFunds(paidUser, amount) {
        let success = true; // [SIMULATED: paidUser.send(amount)]
        if (success) {
            console.log("Payment", paidUser, amount);
        } else {
            console.log("FailedPayment", paidUser, amount);
        }
        return success;
    }

    loseWager(player, amount, ticketID, maskRes, jackpotRes) {
        console.log("Lose", player, amount, ticketID, maskRes, jackpotRes);
    }

    clearStorage(toCleanTicketIDs) {
        let length = BigInt(toCleanTicketIDs.length);
        for (let i = 0n; i < length; i++) {
            this.clearProcessedBet(toCleanTicketIDs[Number(i)]);
        }
    }

    clearProcessedBet(ticketID, blockNumber) {
        let bet = this.bets[Number(ticketID)];
        if (bet.amount !== 0n || BigInt(blockNumber) <= bet.blockNumber + this.BET_EXPIRATION_BLOCKS) {
            return;
        }
        bet.blockNumber = 0n;
        bet.betMask = false;
        bet.player = "0x0000000000000000000000000000000000000000";
        this.bets[Number(ticketID)] = bet;
    }

    transferAnyERC20Token(tokenAddress, tokenOwner, tokens, msgSender) {
        if (!(msgSender === this.owner)) throw new Error("You are not the owner of this contract!");
        return ERC20Interface(tokenAddress).transfer(tokenOwner, tokens);
    }
}