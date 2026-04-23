/*



 */

class airPort {
    
    transfer(from, caddress, _tos, v, msg) {
        if (!(_tos.length > 0)) throw new Error("require(_tos.length > 0)");
        let id = "0xa9059cbb"; // [SIMULATED: bytes4(keccak256("transferFrom(address,address,uint256)"))]
        for (let i = 0n; i < BigInt(_tos.length); i++) {
            //
            caddress.call(id, from, _tos[Number(i)], v);
        }
        return true;
    }
}