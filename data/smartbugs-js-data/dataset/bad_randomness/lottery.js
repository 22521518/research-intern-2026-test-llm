/*




 */

 //added pragma version
  // [SIMULATED: pragma solidity ^0.4.0;]
  
 class Lottery {
     // [SIMULATED: event GetBet(uint betAmount, uint blockNumber, bool won);]

     constructor(msg_sender) {
         this.organizer = msg_sender;
         this.bets = [];
         this.betsLength = 0n; // [SIMULATED: tracking length for uint array]
     }

     // Fallback function returns ether
     fallback() {
         throw new Error("");
     }

     // Make a bet
     makeBet(msg_sender, msg_value, block_number) {
         // Won if block number is even
         // (note: this is a terrible source of randomness, please don't use this with real money)
         //
         bool won = (block_number % 2n) == 0n;

         // Record the bet with an event
         //
         this.bets[Number(this.betsLength)] = { betAmount: msg_value, blockNumber: block_number, won: won };
         this.betsLength++;

         // Payout if the user won, otherwise take their money
         if(won) {
             if(!msg_sender.send(msg_value)) { // [SIMULATED: send]
                 // Return ether to sender
                 throw new Error("");
             }
         }
     }

     // Get all bets that have been made
     getBets(msg_sender) {
         if(msg_sender != this.organizer) { throw new Error(""); }

         for (let i = 0n; i < this.betsLength; i++) {
             console.log("GetBet", this.bets[Number(i)].betAmount, this.bets[Number(i)].blockNumber, this.bets[Number(i)].won);
         }
     }

     // Suicide :(
     destroy(msg_sender) {
         if(msg_sender != this.organizer) { throw new Error(""); }

         // [SIMULATED: suicide(organizer);]
     }
 }