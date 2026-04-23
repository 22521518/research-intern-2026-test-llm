/*



 */

class OddsAndEvens {

  constructor(msg_sender) {
    this.players = [null, null]; // [SIMULATED: Fixed size array]
    this.tot = 0n;
    this.owner = "";
    this.balance = 0n; // [SIMULATED: Contract balance]

    this.owner = msg_sender;
  }
//
  play(number, msg_sender, msg_value) {
    if (!(msg_value === 1000000000000000000n)) throw new Error("");
    //
    this.players[Number(this.tot)] = {addr: msg_sender, number: number};
    this.tot++;

    if (this.tot === 2n) this.andTheWinnerIs();
  }

  andTheWinnerIs() {
    let res;
    let n = this.players[0].number + this.players[1].number;
    if (n % 2n === 0n) {
      res = true; // [SIMULATED: address.send]
    }
    else {
      res = true; // [SIMULATED: address.send]
    }

    this.players = [null, null];
    this.tot = 0n;
  }

  getProfit(msg_sender) {
    if(!(msg_sender !== this.owner)) throw new Error("");
    let res = true; // [SIMULATED: address.send]
  }

}