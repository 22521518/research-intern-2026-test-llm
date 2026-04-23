/*



 */

// [SIMULATED: pragma solidity ^0.4.10;]

class IntegerOverflowAdd {
    constructor() {
        this.balanceOf = {}; // [SIMULATED: mapping (address => uint256)]
    }

    // INSECURE
    transfer(_to, _value, msg_sender) {
        /* Check if sender has balance */
        if (!(this.balanceOf[msg_sender] >= _value)) throw new Error("require");
        
        // Handle underflow for uint256
        if (this.balanceOf[msg_sender] < _value) {
            this.balanceOf[msg_sender] = (this.balanceOf[msg_sender] - _value + 2n**256n) % 2n**256n;
        } else {
            this.balanceOf[msg_sender] -= _value;
        }
        
        //
        this.balanceOf[_to] = (this.balanceOf[_to] + _value) % 2n**256n;
    }
}