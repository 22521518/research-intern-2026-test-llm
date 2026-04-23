/*



 */

//added pragma version
// [SIMULATED: pragma solidity ^0.4.0;]

class Government {
     constructor(msg_value, msg_sender, block_timestamp) {
         // Global Variables
         this.lastCreditorPayedOut = 0n;
         this.lastTimeOfNewCredit = 0n;
         this.profitFromCrash = 0n;
         this.creditorAddresses = [];
         this.creditorAmounts = [];
         this.corruptElite = "";
         this.buddies = {}; // [SIMULATED: mapping (address => uint) buddies;]
         this.TWELVE_HOURS = 43200n;
         this.round = 0n;

         // The corrupt elite establishes a new government
         // this is the commitment of the corrupt Elite - everything that can not be saved from a crash
         this.profitFromCrash = msg_value;
         this.corruptElite = msg_sender;
         this.lastTimeOfNewCredit = block_timestamp;
     }

     lendGovernmentMoney(buddy, msg_value, msg_sender, block_timestamp, contract_balance) {
         let amount = msg_value;
         // check if the system already broke down. If for 12h no new creditor gives new credit to the system it will brake down.
         // 12h are on average = 60*60*12/12.5 = 3456
         if (this.lastTimeOfNewCredit + this.TWELVE_HOURS < block_timestamp) {
             // Return money to sender
             // [SIMULATED: msg.sender.send(amount);]
             // Sends all contract money to the last creditor
             // [SIMULATED: creditorAddresses[creditorAddresses.length - 1].send(profitFromCrash);]
             // [SIMULATED: corruptElite.send(this.balance);]
             // Reset contract state
             this.lastCreditorPayedOut = 0n;
             this.lastTimeOfNewCredit = block_timestamp;
             this.profitFromCrash = 0n;
            //
             this.creditorAddresses = [];
            //
             this.creditorAmounts = [];
             this.round += 1n;
             return false;
         }
         else {
             // the system needs to collect at least 1% of the profit from a crash to stay alive
             if (amount >= 10n ** 18n) {
                 // the System has received fresh money, it will survive at leat 12h more
                 this.lastTimeOfNewCredit = block_timestamp;
                 // register the new creditor and his amount with 10% interest rate
                 this.creditorAddresses.push(msg_sender);
                 this.creditorAmounts.push(amount * 110n / 100n);
                 // now the money is distributed
                 // first the corrupt elite grabs 5% - thieves!
                 // [SIMULATED: corruptElite.send(amount * 5/100);]
                 // 5% are going into the economy (they will increase the value for the person seeing the crash comming)
                 if (this.profitFromCrash < 10000n * 10n**18n) {
                     this.profitFromCrash += amount * 5n / 100n;
                 }
                 // if you have a buddy in the government (and he is in the creditor list) he can get 5% of your credits.
                 // Make a deal with him.
                 if(this.buddies[buddy] >= amount) {
                     // [SIMULATED: buddy.send(amount * 5/100);]
                 }
                 this.buddies[msg_sender] = (this.buddies[msg_sender] || 0n) + amount * 110n / 100n;
                 // 90% of the money will be used to pay out old creditors
                 if (this.creditorAmounts[Number(this.lastCreditorPayedOut)] <= contract_balance - this.profitFromCrash) {
                     // [SIMULATED: creditorAddresses[lastCreditorPayedOut].send(creditorAmounts[lastCreditorPayedOut]);]
                     this.buddies[this.creditorAddresses[Number(this.lastCreditorPayedOut)]] -= this.creditorAmounts[Number(this.lastCreditorPayedOut)];
                     this.lastCreditorPayedOut += 1n;
                 }
                 return true;
             }
             else {
                 // [SIMULATED: msg.sender.send(amount);]
                 return false;
             }
         }
     }

     // fallback function
     fallback(msg_value, msg_sender, block_timestamp, contract_balance) {
         this.lendGovernmentMoney("0", msg_value, msg_sender, block_timestamp, contract_balance);
     }

     totalDebt() {
         let debt = 0n;
         for(let i=this.lastCreditorPayedOut; i<BigInt(this.creditorAmounts.length); i++){
             debt += this.creditorAmounts[Number(i)];
         }
         return debt;
     }

     totalPayedOut() {
         let payout = 0n;
         for(let i=0n; i<this.lastCreditorPayedOut; i++){
             payout += this.creditorAmounts[Number(i)];
         }
         return payout;
     }

     // better don't do it (unless you are the corrupt elite and you want to establish trust in the system)
     investInTheSystem(msg_value) {
         this.profitFromCrash += msg_value;
     }

     // From time to time the corrupt elite inherits it's power to the next generation
     inheritToNextGeneration(nextGeneration, msg_sender) {
         if (msg_sender == this.corruptElite) {
             this.corruptElite = nextGeneration;
         }
     }

     getCreditorAddresses() {
         return this.creditorAddresses;
     }

     getCreditorAmounts() {
         return this.creditorAmounts;
     }
 }