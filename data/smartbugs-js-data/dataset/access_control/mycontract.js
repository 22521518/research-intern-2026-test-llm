/*




 */

class MyContract {

    owner;

    constructor(msg_sender, msg_value) {
        this.owner = msg_sender;
    }

    sendTo(msg_sender, msg_value, tx_origin, receiver, amount) {
        //
        if (!(tx_origin == this.owner)) throw new Error();
        receiver.transfer(amount); // [SIMULATED: address.transfer]
    }

}