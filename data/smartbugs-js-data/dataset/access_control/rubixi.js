/*



 */

 // 0xe82719202e5965Cf5D9B6673B7503a3b92DE20be#code
 pragma solidity ^0.4.15;

 class Rubixi {
         //Declare variables for storage critical to contract
         balance = 0n;
         collectedFees = 0n;
         feePercent = 10n;
         pyramidMultiplier = 300n;
         payoutOrder = 0n;

         creator = "";

         //Sets creator
         //
         DynamicPyramid(msgSender) {
                 creator = msgSender; //anyone can call this
         }

         // modifier onlyowner inlined

         // Participant struct simulated as object

         participants = [];
         participantsLength = 0n;

         //Fallback function
         fallback(msgSender, msgValue) {
                 this.init(msgSender, msgValue);
         }

         //init function run on fallback
         init(msgSender, msgValue) {
                 //Ensures only tx with value of 1 ether or greater are processed and added to pyramid
                 if (msgValue < 1000000000000000000n) {
                         this.collectedFees += msgValue;
                         return;
                 }

                 let _fee = this.feePercent;
                 //50% fee rebate on any ether value of 50 or greater
                 if (msgValue >= 50000000000000000000n) _fee /= 2n;

                 this.addPayout(_fee, msgSender, msgValue);
         }

         //Function called for valid tx to the contract
         addPayout(_fee, msgSender, msgValue) {
                 //Adds new address to participant array
                 this.participants.push({ etherAddress: msgSender, payout: (msgValue * this.pyramidMultiplier) / 100n });
                 this.participantsLength++;

                 //These statements ensure a quicker payout system to later pyramid entrants, so the pyramid has a longer lifespan
                 if (this.participantsLength == 10n) this.pyramidMultiplier = 200n;
                 else if (this.participantsLength == 25n) this.pyramidMultiplier = 150n;

                 // collect fees and update contract balance
                 this.balance += (msgValue * (100n - _fee)) / 100n;
                 this.collectedFees += (msgValue * _fee) / 100n;

                 //Pays earlier participiants if balance sufficient
                 while (this.balance > this.participants[Number(this.payoutOrder)].payout) {
                         let payoutToSend = this.participants[Number(this.payoutOrder)].payout;
                         // [SIMULATED: this.participants[Number(this.payoutOrder)].etherAddress.send(payoutToSend)]

                         this.balance = this.balance - this.participants[Number(this.payoutOrder)].payout;
                         if (this.balance < 0n) this.balance += 2n**256n;
                         this.payoutOrder += 1n;
                 }
         }

         //Fee functions for creator
         collectAllFees(msgSender) {
                 if (msgSender !== this.creator) throw new Error("onlyowner");
                 if (this.collectedFees == 0n) throw new Error("throw");

                 // [SIMULATED: this.creator.send(this.collectedFees)]
                 this.collectedFees = 0n;
         }

         collectFeesInEther(_amt, msgSender) {
                 if (msgSender !== this.creator) throw new Error("onlyowner");
                 _amt *= 1000000000000000000n;
                 if (_amt > this.collectedFees) this.collectAllFees(msgSender);

                 if (this.collectedFees == 0n) throw new Error("throw");

                 // [SIMULATED: this.creator.send(_amt)]
                 this.collectedFees = this.collectedFees - _amt;
                 if (this.collectedFees < 0n) this.collectedFees += 2n**256n;
         }

         collectPercentOfFees(_pcent, msgSender) {
                 if (msgSender !== this.creator) throw new Error("onlyowner");
                 if (this.collectedFees == 0n || _pcent > 100n) throw new Error("throw");

                 let feesToCollect = (this.collectedFees / 100n) * _pcent;
                 // [SIMULATED: this.creator.send(feesToCollect)]
                 this.collectedFees = this.collectedFees - feesToCollect;
                 if (this.collectedFees < 0n) this.collectedFees += 2n**256n;
         }

         //Functions for changing variables related to the contract
         changeOwner(_owner, msgSender) {
                 if (msgSender !== this.creator) throw new Error("onlyowner");
                 this.creator = _owner;
         }

         changeMultiplier(_mult, msgSender) {
                 if (msgSender !== this.creator) throw new Error("onlyowner");
                 if (_mult > 300n || _mult < 120n) throw new Error("throw");

                 this.pyramidMultiplier = _mult;
         }

         changeFeePercentage(_fee, msgSender) {
                 if (msgSender !== this.creator) throw new Error("onlyowner");
                 if (_fee > 10n) throw new Error("throw");

                 this.feePercent = _fee;
         }

         //Functions to provide information to end-user using JSON interface or other interfaces
         currentMultiplier() {
                 let multiplier = this.pyramidMultiplier;
                 let info = 'This multiplier applies to you as soon as transaction is received, may be lowered to hasten payouts or increased if payouts are fast enough. Due to no float or decimals, multiplier is x100 for a fractional multiplier e.g. 250 is actually a 2.5x multiplier. Capped at 3x max and 1.2x min.';
                 return { multiplier, info };
         }

         currentFeePercentage() {
                 let fee = this.feePercent;
                 let info = 'Shown in % form. Fee is halved(50%) for amounts equal or greater than 50 ethers. (Fee may change, but is capped to a maximum of 10%)';
                 return { fee, info };
         }

         currentPyramidBalanceApproximately() {
                 let pyramidBalance = this.balance / 1000000000000000000n;
                 let info = 'All balance values are measured in Ethers, note that due to no decimal placing, these values show up as integers only, within the contract itself you will get the exact decimal value you are supposed to';
                 return { pyramidBalance, info };
         }

         nextPayoutWhenPyramidBalanceTotalsApproximately() {
                 let balancePayout = this.participants[Number(this.payoutOrder)].payout / 1000000000000000000n;
                 return { balancePayout };
         }

         feesSeperateFromBalanceApproximately() {
                 let fees = this.collectedFees / 1000000000000000000n;
                 return { fees };
         }

         totalParticipants() {
                 let count = this.participantsLength;
                 return { count };
         }

         numberOfParticipantsWaitingForPayout() {
                 let count = this.participantsLength - this.payoutOrder;
                 return { count };
         }

         participantDetails(orderInPyramid) {
                 if (orderInPyramid <= this.participantsLength) {
                         let Address = this.participants[Number(orderInPyramid)].etherAddress;
                         let Payout = this.participants[Number(orderInPyramid)].payout / 1000000000000000000n;
                         return { Address, Payout };
                 }
         }
 }