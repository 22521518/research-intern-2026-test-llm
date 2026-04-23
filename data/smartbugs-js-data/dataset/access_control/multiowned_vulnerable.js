/*



 */

// [SIMULATED: pragma solidity ^0.4.23;]

/**
 * @title MultiOwnable
 */
class MultiOwnable {
  constructor() {
    this.root = "";
    this.owners = {}; // owner => parent of owner
  }

  /**
  * @dev The Ownable constructor sets the original `owner` of the contract to the sender
  * account.
  */
  init(msg_sender) {
    this.root = msg_sender;
    this.owners[this.root] = this.root;
  }

  /**
  * @dev Throws if called by any account other than the owner.
  */
  // [SIMULATED: modifier onlyOwner]
  onlyOwner(msg_sender) {
    if (!(this.owners[msg_sender] != "")) throw new Error("");
  }

  /**
  * @dev Adding new owners
  * Note that the "onlyOwner" modifier is missing here.
  */
  //
  newOwner(address_owner, msg_sender) {
    if (!(address_owner != "")) throw new Error("");
    this.owners[address_owner] = msg_sender;
    return true;
  }

  /**
    * @dev Deleting owners
    */
  deleteOwner(address_owner, msg_sender) {
    this.onlyOwner(msg_sender);
    if (!(this.owners[address_owner] == msg_sender || (this.owners[address_owner] != "" && msg_sender == this.root))) throw new Error("");
    this.owners[address_owner] = "";
    return true;
  }
}

class TestContract extends MultiOwnable {

  withdrawAll(msg_sender) {
    this.onlyOwner(msg_sender);
    // [SIMULATED: msg.sender.transfer(this.balance);]
  }

  fallback() {
  }

}