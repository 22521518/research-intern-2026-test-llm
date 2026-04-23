/*



 */

class demo {
    constructor() {
    }

    transfer(msg_sender, msg_value, from, caddress, _tos, v) {
        if (!(_tos.length > 0)) throw new Error("require(_tos.length > 0)");
        let id = keccak256("transferFrom(address,address,uint256)").slice(0, 10); // [SIMULATED: bytes4]
        for (let i = 0n; i < BigInt(_tos.length); i++) {
            //
            caddress.call(id, from, _tos[Number(i)], v); // [SIMULATED: call]
        }
        return true;
    }
}