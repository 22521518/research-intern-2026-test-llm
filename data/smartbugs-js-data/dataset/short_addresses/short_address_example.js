/*



 */

 class MyToken {
     constructor(tx_origin) {
         this.balances = {}; // [SIMULATED: mapping]
         this.balances[tx_origin] = 10000n;
     }

     //
     sendCoin(to, amount, msg_sender) {
         if (this.balances[msg_sender] < amount) return false;
         this.balances[msg_sender] -= amount;
         this.balances[to] += amount;
         console.log("Transfer", msg_sender, to, amount);
         return true;
     }

     getBalance(addr) {
         return this.balances[addr];
     }
 }