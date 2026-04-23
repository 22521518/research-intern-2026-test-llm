/*



 */

 //This code is derived from the Capture the Ether https://capturetheether.com/challenges/math/mapping/

 class Map {
     owner = "";
     map = [];

     set(key, value) {
         if (BigInt(this.map.length) <= key) {
             this.map.length = Number(key + 1n);
         }
        //
         this.map[Number(key)] = value;
     }

     get(key) {
         return this.map[Number(key)];
     }
     withdraw(msg_sender) {
       if (!(msg_sender === this.owner)) throw new Error();
       // [SIMULATED: transfer]
       msg_sender.transfer(this.balance);
     }
 }