/*



 */

 /* User can add pay in and withdraw Ether.
    Unfortunately the developer forgot set the user's balance to 0 when refund() is called.
    An attacker can pay in a small amount of Ether and call refund() repeatedly to empty the contract.
 */

 class Wallet {
     creator;

     balances = {};

     balance = 0n; // [SIMULATED: this.balance]

     constructor(msg_sender) {
         this.creator = msg_sender;
     }

     deposit(msg_sender, msg_value) {
         if (!((this.balances[msg_sender] || 0n) + msg_value > (this.balances[msg_sender] || 0n))) throw new Error("assert failed");
         this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
     }

     withdraw(amount, msg_sender) {
         if (!(amount <= (this.balances[msg_sender] || 0n))) throw new Error();
         console.log(msg_sender + ".transfer(" + amount + ")"); // [SIMULATED: transfer]
         let res = (this.balances[msg_sender] || 0n) - amount;
         this.balances[msg_sender] = res < 0n ? res + (2n**256n) : res;
     }

     refund(msg_sender) {
         //
         console.log(msg_sender + ".transfer(" + (this.balances[msg_sender] || 0n) + ")"); // [SIMULATED: transfer]
     }

     // In an emergency the owner can migrate  allfunds to a different address.

     migrateTo(to, msg_sender) {
         if (!(this.creator == msg_sender)) throw new Error();
         console.log(to + ".transfer(" + this.balance + ")"); // [SIMULATED: transfer]
     }

 }