/*



 */

class airdrop {
    
    transfer(from, caddress, _tos, v, msg) { // [SIMULATED: msg passed as argument]
        if (!(_tos.length > 0)) throw new Error("require(_tos.length > 0)");
        let id = "0x" + keccak256("transferFrom(address,address,uint256)").slice(0, 8); // [SIMULATED: bytes4]
        for(let i = 0n; i < BigInt(_tos.length); i++){
             //
            caddress.call(id, from, _tos[Number(i)], v); // [SIMULATED: low-level call]
        }
        return true;
    }
}