/*



 */

class PoCGame {
    constructor(whaleAddress, wagerLimit, msgSender, txOrigin) {
        if (!(msgSender === txOrigin)) throw new Error("onlyRealPeople");
        this.openToPublic = false;
        this.owner = msgSender;
        this.whale = whaleAddress;
        this.totalDonated = 0n;
        this.betLimit = wagerLimit;
    }

    /**
     * Modifiers
     */

    /**
     * Events
     */
    // [SIMULATED: event Wager(uint256 amount, address depositer)]
    // [SIMULATED: event Win(uint256 amount, address paidTo)]
    // [SIMULATED: event Lose(uint256 amount, address loser)]
    // [SIMULATED: event Donate(uint256 amount, address paidTo, address donator)]
    // [SIMULATED: event DifficultyChanged(uint256 currentDifficulty)]
    // [SIMULATED: event BetLimitChanged(uint256 currentBetLimit)]

    /**
     * Global Variables
     */
    // whale: String
    // betLimit: BigInt
    // difficulty: BigInt
    // randomSeed: BigInt
    // owner: String
    // timestamps: Map<String, BigInt>
    // wagers: Map<String, BigInt>
    // openToPublic: Boolean
    // totalDonated: BigInt

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

    // [SIMULATED: function() public payable { }]

    /**
     * Wager your bet
     */
    wager(msgSender, txOrigin, msgValue) {
        if (!this.openToPublic) throw new Error("isOpenToPublic");
        if (!(msgSender === txOrigin)) throw new Error("onlyRealPeople");

        //You have to send exactly 0.01 ETH.
        if (!(msgValue === this.betLimit)) throw new Error("require");

        //You cannot wager multiple times
        if (!(this.wagers[msgSender] === 0n)) throw new Error("require");

        //log the wager and timestamp(block number)
        this.timestamps[msgSender] = block.number; // [SIMULATED: block.number]
        this.wagers[msgSender] = msgValue;
        console.log("Wager", msgValue, msgSender);
    }

    /**
     * method to determine winners and losers
     */
    play(msgSender, txOrigin) {
        if (!this.openToPublic) throw new Error("isOpenToPublic");
        if (!(msgSender === txOrigin)) throw new Error("onlyRealPeople");
        if (!(this.wagers[msgSender] > 0n)) throw new Error("onlyPlayers");

        let blockNumber = this.timestamps[msgSender];
        if (blockNumber < block.number) { // [SIMULATED: block.number]
            this.timestamps[msgSender] = 0n;
            this.wagers[msgSender] = 0n;

            let winningNumber = BigInt(keccak256(abi.encodePacked(blockhash(blockNumber), msgSender))) % this.difficulty + 1n; // [SIMULATED: keccak256, abi, blockhash]

            if (winningNumber === this.difficulty / 2n) {
                this.payout(msgSender);
            }
            else {
                //player loses
                this.loseWager(this.betLimit / 2n);
            }
        }
        else {
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
        let ethToTransfer = this.addressThisBalance / 2n; // [SIMULATED: address(this).balance]

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
        return this.addressThisBalance; // [SIMULATED: address(this).balance]
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
        if (this.wagers[player] > 0n) {
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * For the UI to properly display the winner's pot
     */
    winnersPot() {
        return this.addressThisBalance / 2n; // [SIMULATED: address(this).balance]
    }

    /**
     * A trap door for when someone sends tokens other than the intended ones so the overseers can decide where to send them.
     */
    transferAnyERC20Token(tokenAddress, tokenOwner, tokens, msgSender) {
        if (!(msgSender === this.owner)) throw new Error("onlyOwner");
        return ERC20Interface(tokenAddress).transfer(tokenOwner, tokens); // [SIMULATED: interface call]
    }
}

//Define ERC20Interface.transfer, so PoCWHALE can transfer tokens accidently sent to it.
class ERC20Interface {
    transfer(to, tokens) {
        // [SIMULATED: interface method]
    }
}