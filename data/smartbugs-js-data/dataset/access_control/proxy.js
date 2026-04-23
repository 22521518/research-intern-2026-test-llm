/*



 */

class Proxy {

  owner;

  constructor(msg_sender) {
    this.owner = msg_sender;
  }

  forward(callee, _data) {
    //
    if (!callee.delegatecall(_data)) throw new Error(); // [SIMULATED: delegatecall] //Use delegatecall with caution and make sure to never call into untrusted contracts
  }

}