/*



 */

class Token {
    transfer(_to, _value) {} // [SIMULATED: interface]
    balanceOf(_owner) {} // [SIMULATED: interface]
}
class EtherGet {
    constructor(msg_sender) {
        this.owner = msg_sender;
    }
    withdrawTokens(tokenContract, msg_sender) {
        let tc = tokenContract; // [SIMULATED: cast]
        tc.transfer(this.owner, tc.balanceOf(this));
    }
    withdrawEther(msg_sender) {
        this.owner.transfer(this.balance); // [SIMULATED: address.transfer]
    }
    getTokens(num, addr, msg_sender) {
        for(let i = 0n; i < num; i++){
            //
            addr.call({value: 0n}); // [SIMULATED: low-level call]
        }
    }
}