/*



 */

class PoCGame {
    constructor(whaleAddress, wagerLimit, msgSender, txOrigin) {
        this.whale = whaleAddress;
        this.betLimit = wagerLimit;
        this.difficulty = 0n; // [SIMULATED: uint]
        this.randomSeed = 0n; // [SIMULATED: uint]
        this.owner = msgSender;
        this.timestamps = {}; // [SIMULATED: mapping]
        this.wagers = {}; // [SIMULATED: mapping]
        this.openToPublic = false;
        this.totalDonated = 0n;
        
        if (!(msgSender === txOrigin)) throw new Error("onlyRealPeople");
        this.openToPublic = false;
        this.owner = msgSender;
        this.whale = whaleAddress;
        this.totalDonated = 0n;
        this.betLimit = wagerLimit;
    }

    /**
     * Let the public play
     */
    OpenToThePublic(msgSender) {
        if (!(msgSender === this.owner)) throw new Error("onlyOwner");
        this.openToPublic = true;
    }
    
    /**
     * Adjust the bet amounts
     */
    AdjustBetAmounts(amount, msgSender) {
        if (!(msgSender === this.owner)) throw new Error("onlyOwner");
        this.betLimit = amount;
        
        console.log("BetLimitChanged", this.betLimit);
    }
    
     /**
     * Adjust the difficulty
     */
    AdjustDifficulty(amount, msgSender) {
        if (!(msgSender === this.owner)) throw new Error("onlyOwner");
        this.difficulty = amount;
        
        console.log("DifficultyChanged", this.difficulty);
    }
    
    
    fallback() {} // [SIMULATED: function() public payable]

    /**
     * Wager your bet
     */
    wager(msgSender, msgValue, blockNumber) {
        if (!this.openToPublic) throw new Error("isOpenToPublic");
        if (!(msgSender === msgSender)) throw new Error("onlyRealPeople"); // [SIMULATED: tx.origin check]
        
        //You have to send exactly 0.01 ETH.
        if (!(msgValue === this.betLimit)) throw new Error("require(msg.value == betLimit)");

        //log the wager and timestamp(block number)
        this.timestamps[msgSender] = blockNumber;
        this.wagers[msgSender] = msgValue;
        console.log("Wager", msgValue, msgSender);
    }
    
    /**
     * method to determine winners and losers
     */
    play(msgSender, blockNumber, currentBlockNumber) {
        if (!this.openToPublic) throw new Error("isOpenToPublic");
        if (!(msgSender === msgSender)) throw new Error("onlyRealPeople");
        if (!(this.wagers[msgSender] > 0n)) throw new Error("onlyPlayers");
        
        let blockNumberVal = this.timestamps[msgSender];
        if(blockNumberVal < currentBlockNumber)
        {
            this.timestamps[msgSender] = 0n;
            this.wagers[msgSender] = 0n;
    
            let winningNumber = BigInt(keccak256(abi.encodePacked(blockhash(blockNumberVal),  msgSender))) % this.difficulty + 1n;
    
            if(winningNumber === this.difficulty / 2n)
            {
                this.payout(msgSender);
            }
            else 
            {
                //player loses
                this.loseWager(this.betLimit / 2n);
            }    
        }
        else
        {
            throw new Error("revert");
        }
    }

    /**
     * For those that just want to donate to the whale
     */
    donate(msgValue, msgSender) {
        if (!this.openToPublic) throw new Error("isOpenToPublic");
        this.donateToWhale(msgValue, msgSender);
    }

    /**
     * Payout ETH to winner
     */
    payout(winner) {
        let ethToTransfer = this.getBalance() / 2n;
        
        // winner.transfer(ethToTransfer); // [SIMULATED: transfer]
        console.log("Win", ethToTransfer, winner);
    }

    /**
     * Payout ETH to whale
     */
    donateToWhale(amount, msgSender) {
        //
        // whale.call.value(amount)(bytes4(keccak256("donate()"))); // [SIMULATED: low-level call]
        this.totalDonated += amount;
        console.log("Donate", amount, this.whale, msgSender);
    }

    /**
     * Payout ETH to whale when player loses
     */
    loseWager(amount, msgSender) {
        //
        // whale.call.value(amount)(bytes4(keccak256("donate()"))); // [SIMULATED: low-level call]
        this.totalDonated += amount;
        console.log("Lose", amount, msgSender);
    }
    

    /**
     * ETH balance of contract
     */
    ethBalance() {
        return this.getBalance();
    }
    
    
    /**
     * current difficulty of the game
     */
    currentDifficulty() {
        return this.difficulty;
    }
    
    
    /**
     * current bet amount for the game
     */
    currentBetLimit() {
        return this.betLimit;
    }
    
    hasPlayerWagered(player) {
        if(this.wagers[player] > 0n)
        {
            return true;
        }
        else
        {
            return false;
        }
        
    }

    /**
     * For the UI to properly display the winner's pot
     */
    winnersPot() {
        return this.getBalance() / 2n;
    }

    /**
     * A trap door for when someone sends tokens other than the intended ones so the overseers can decide where to send them.
     */
    transferAnyERC20Token(tokenAddress, tokenOwner, tokens, msgSender) {
        if (!(msgSender === this.owner)) throw new Error("onlyOwner");
        return ERC20Interface(tokenAddress).transfer(tokenOwner, tokens);
    }
    
    getBalance() { return 0n; } // [SIMULATED: address(this).balance]
}

class ERC20Interface {
    transfer(to, tokens) {}
}