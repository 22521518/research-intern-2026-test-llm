/*



 */

// [SIMULATED: pragma solidity ^0.4.22;]

class FindThisHash {
    constructor() {
        this.hash = 0xb5b5b97fafd9855eec9b41f74dfb6c38f5951141f9a3ecd7f44d5479b630ee0a;
    }

    // [SIMULATED: constructor() public payable {}]

    solve(solution, msg_sender, msg_value) {
        // If you can find the pre image of the hash, receive 1000 ether
         //
        if (!(this.hash == sha3(solution))) throw new Error("require");
        msg_sender.transfer(1000000000000000000000n);
    }
}