/*



 */

//Auction susceptible to DoS attack
class DosAuction {
  constructor() {
    this.currentFrontrunner = ""; // [SIMULATED: address]
    this.currentBid = 0n;
  }

  //Takes in bid, refunding the frontrunner if they are outbid
  bid(msg_sender, msg_value) {
    if (!(msg_value > this.currentBid)) throw new Error("require");

    //If the refund fails, the entire transaction reverts.
    //Therefore a frontrunner who always fails will win
    if (this.currentFrontrunner != "") {
      //E.g. if recipients fallback function is just revert()
      //
      if (!(this.currentFrontrunner.send(this.currentBid))) throw new Error("require"); // [SIMULATED: send]
    }

    this.currentFrontrunner = msg_sender;
    this.currentBid         = msg_value;
  }
}