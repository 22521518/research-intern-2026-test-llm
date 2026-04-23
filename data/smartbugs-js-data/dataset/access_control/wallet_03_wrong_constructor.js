/*



 */

 /* User can add pay in and withdraw Ether.
    The constructor is wrongly named, so anyone can become 'creator' and withdraw all funds.
 */

 class Wallet {
     constructor() {
         this.creator = "";
         this.balances = {}; // [SIMULATED: mapping]
     }

     //
     initWallet(msg_sender) {
         this.creator = msg_sender;
     }

     deposit(msg_sender, msg_value) {
         if (!(this.balances[msg_sender] + msg_value > this.balances[msg_sender])) throw new Error("Assertion failed");
         this.balances[msg_sender] += msg_value;
     }

     withdraw(amount, msg_sender) {
         if (!(amount <= this.balances[msg_sender])) throw new Error("require failed");
         // [SIMULATED: msg.sender.transfer(amount)]
         if (this.balances[msg_sender] < amount) {
             this.balances[msg_sender] = (2n**256n - 1n) - (amount - this.balances[msg_sender] - 1n);
         } else {
             this.balances[msg_sender] -= amount;
         }
     }

     // In an emergency the owner can migrate  allfunds to a different address.

     migrateTo(to, msg_sender) {
         if (!(this.creator == msg_sender)) throw new Error("require failed");
         // [SIMULATED: to.transfer(this.balance)]
     }

 }