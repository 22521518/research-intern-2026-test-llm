/*



 */

 // [SIMULATED: pragma solidity ^0.4.18;]

 class Lotto {
     constructor() {
         this.payedOut = false;
         this.winner = ""; // [SIMULATED: address]
         this.winAmount = 0n; // [SIMULATED: uint]
     }

     // ... extra functionality here

     sendToWinner(msg_sender) {
         if (!(!this.payedOut)) throw new Error("require");
         //
         // [SIMULATED: winner.send(winAmount)]
         this.payedOut = true;
     }

     withdrawLeftOver(msg_sender, this_balance) {
         if (!(this.payedOut)) throw new Error("require");
         //
         // [SIMULATED: msg.sender.send(this.balance)]
     }
 }