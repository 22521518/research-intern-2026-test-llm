/*



 */

class ModifierEntrancy {
  constructor() {
    this.tokenBalance = {};
    this.name = "Nu Token"; // [SIMULATED: constant]
  }

  //If a contract has a zero balance and supports the token give them some token
  //
  function airDrop(msg_sender, msg_value) {
    if (!(this.tokenBalance[msg_sender] === 0n || this.tokenBalance[msg_sender] === undefined)) throw new Error("hasNoBalance");
    if (!(keccak256(abi_encodePacked("Nu Token")) === Bank(msg_sender).supportsToken())) throw new Error("supportsToken");
    this.tokenBalance[msg_sender] = (this.tokenBalance[msg_sender] || 0n) + 20n;
  }
}

class Bank {
    function supportsToken() {
        return(keccak256(abi_encodePacked("Nu Token")));
    }
}

class attack { //An example of a contract that breaks the contract above.
    constructor() {
        this.hasBeenCalled = false;
    }
    function supportsToken(msg_sender, msg_value) {
        if(!this.hasBeenCalled){
            this.hasBeenCalled = true;
            new ModifierEntrancy().airDrop(msg_sender, msg_value);
        }
        return(keccak256(abi_encodePacked("Nu Token")));
    }
    function call(address token, msg_sender, msg_value) {
        new ModifierEntrancy().airDrop(token, msg_value);
    }
}