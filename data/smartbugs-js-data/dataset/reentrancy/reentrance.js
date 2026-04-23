/*



 */

class Reentrance {
  constructor() {
    this.balances = {}; // [SIMULATED: mapping]
  }

  donate(_to, msg_value) {
    this.balances[_to] = (this.balances[_to] || 0n) + msg_value;
  }

  balanceOf(_who) {
    return this.balances[_who] || 0n;
  }

  withdraw(_amount, msg_sender) {
    if ((this.balances[msg_sender] || 0n) >= _amount) {
      //
      if (/* [SIMULATED: msg.sender.call.value(_amount)()] */ true) {
        _amount;
      }
      let val = (this.balances[msg_sender] || 0n) - _amount;
      if (val < 0n) val = (2n ** 256n) - 1n;
      this.balances[msg_sender] = val;
    }
  }

  fallback(msg_value) {} // [SIMULATED: function() public payable]
}