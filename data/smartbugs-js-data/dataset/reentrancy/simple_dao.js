/*



 */

class SimpleDAO {
  constructor() {
    this.credit = {}; // [SIMULATED: mapping]
  }

  donate(to, msg_value) {
    this.credit[to] = (this.credit[to] || 0n) + msg_value;
  }

  withdraw(amount, msg_sender, msg_sender_call_value) {
    if (this.credit[msg_sender] >= amount) {
      //
      let res = msg_sender_call_value(amount);
      if (this.credit[msg_sender] < amount) {
        this.credit[msg_sender] = (2n ** 256n - 1n) - (amount - this.credit[msg_sender] - 1n);
      } else {
        this.credit[msg_sender] -= amount;
      }
    }
  }

  queryCredit(to) {
    return this.credit[to] || 0n;
  }
}