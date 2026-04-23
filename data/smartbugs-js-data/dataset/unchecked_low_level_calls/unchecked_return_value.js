/*



 */

// [SIMULATED: pragma solidity 0.4.25;]

class ReturnValue {

  callchecked(callee) {
    if (!callee.call()) throw new Error("require(callee.call())");
  }

  callnotchecked(callee) {
     //
    callee.call();
  }
}