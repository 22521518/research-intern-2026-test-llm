/*



 */

 /* User can add pay in and withdraw Ether.
    Unfortunatelty, the developer was drunk and used the wrong comparison operator in "withdraw()"
    Anybody can withdraw arbitrary amounts of Ether :()
 */

 class Wallet {
     constructor(msg_sender) {
         this.creator = msg_sender;
         this.balances = {}; // [SIMULATED: mapping]
     }

     deposit(msg_sender, msg_value) {
         if (!(this.balances[msg_sender] + msg_value > (this.balances[msg_sender] || 0n))) throw new Error("Assertion failed");
         this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
     }

     withdraw(amount, msg_sender) {
         //
         if (!(amount >= (this.balances[msg_sender] || 0n))) throw new Error("require");
         // [SIMULATED: msg.sender.transfer(amount)]
         if ((this.balances[msg_sender] || 0n) - amount < 0n) {
             this.balances[msg_sender] = (2n**256n - 1n) - (amount - (this.balances[msg_sender] || 0n) - 1n);
         } else {
             this.balances[msg_sender] = (this.balances[msg_sender] || 0n) - amount;
         }
     }

     // In an emergency the owner can migrate  allfunds to a different address.

     migrateTo(to, msg_sender) {
         if (!(this.creator == msg_sender)) throw new Error("require");
         // [SIMULATED: to.transfer(this.balance)]
     }

 }