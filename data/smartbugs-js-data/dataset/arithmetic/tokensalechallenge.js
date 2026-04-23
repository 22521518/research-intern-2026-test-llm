/*



 */

class TokenSaleChallenge {
    constructor() {
        this.balanceOf = {};
        this.PRICE_PER_TOKEN = 1000000000000000000n;
        this.contractBalance = 0n; // [SIMULATED: address(this).balance]
    }

    TokenSaleChallenge(_player, msgValue) {
        if (!(msgValue === 1000000000000000000n)) throw new Error("require");
        this.contractBalance += msgValue;
    }

    isComplete() {
        return this.contractBalance < 1000000000000000000n;
    }

    buy(numTokens, msgSender, msgValue) {
        //
        if (!(msgValue === numTokens * this.PRICE_PER_TOKEN)) throw new Error("require");
        //
        this.balanceOf[msgSender] = (this.balanceOf[msgSender] || 0n) + numTokens;
        this.contractBalance += msgValue;
    }

    sell(numTokens, msgSender) {
        if (!( (this.balanceOf[msgSender] || 0n) >= numTokens)) throw new Error("require");

        this.balanceOf[msgSender] -= numTokens;
        //
        let transferAmount = numTokens * this.PRICE_PER_TOKEN;
        this.contractBalance -= transferAmount;
        // [SIMULATED: msg.sender.transfer(transferAmount)]
    }
}