/*



 */

 class Token {

   constructor(_initialSupply, msg_sender) {
     this.balances = {}; // [SIMULATED: mapping]
     this.totalSupply = 0n;
     this.balances[msg_sender] = this.totalSupply = _initialSupply;
   }

   transfer(_to, _value, msg_sender) {
     //
     if (!(this.balances[msg_sender] - _value >= 0n)) throw new Error("require");
     //
     this.balances[msg_sender] -= _value;
     if (this.balances[msg_sender] < 0n) this.balances[msg_sender] = (2n**256n - 1n) + (this.balances[msg_sender] % (2n**256n)) + 1n; // [SIMULATED: underflow]
     this.balances[_to] = (this.balances[_to] || 0n) + _value;
     return true;
   }

   balanceOf(_owner) {
     return this.balances[_owner] || 0n;
   }
 }