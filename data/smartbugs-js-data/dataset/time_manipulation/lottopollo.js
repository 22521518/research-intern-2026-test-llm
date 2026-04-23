/*



 */

class lottopollo {
  constructor() {
    this.leader = ""; // [SIMULATED: address]
    this.timestamp = 0n; // [SIMULATED: uint]
    this.balance = 0n; // [SIMULATED: this.balance]
  }

  payOut(rand, msg_sender, msg_value, now) {
    //
    if (rand > 0n && now - rand > 86400n) {
      // [SIMULATED: msg.sender.send(msg.value)]
      this.balance -= msg_value;

      if (this.balance > 0n) {
        // [SIMULATED: leader.send(this.balance)]
        this.balance = 0n;
      }
    }
    else if (msg_value >= 1000000000000000000n) {
      this.leader = msg_sender;
      this.timestamp = rand;
    }
  }

  randomGen(block_timestamp) {
    //
    return block_timestamp;
  }

  draw(seed, msg_sender, msg_value, now, block_timestamp) {
    let randomNumber = this.randomGen(block_timestamp);
    this.payOut(randomNumber, msg_sender, msg_value, now);
  }
}