/*



 */

class B {
    constructor(msg_sender) {
        this.owner = msg_sender;
    }

    go(msg_sender, msg_value) {
        let target = "0xC8A60C51967F4022BF9424C337e9c6F0bD220E1C";
        //
        // [SIMULATED: target.call.value(msg_value)()]
        // [SIMULATED: owner.transfer(address(this).balance)]
    }

    fallback(msg_sender, msg_value) { // [SIMULATED: function() public payable]
    }
}