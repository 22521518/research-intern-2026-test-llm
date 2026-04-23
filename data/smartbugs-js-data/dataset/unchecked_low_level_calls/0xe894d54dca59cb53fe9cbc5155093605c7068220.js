/*



 */

class airDrop {
    
    transfer(from, caddress, _tos, v, _decimals, msg_sender, msg_value) {
        if (!(_tos.length > 0)) throw new Error("");
        let id = "0xa9059cbb"; // [SIMULATED: bytes4(keccak256("transferFrom(address,address,uint256)"))]
        let _value = BigInt(v) * (10n ** BigInt(_decimals));
        for(let i = 0n; i < BigInt(_tos.length); i++){
            //
            caddress.call(id, from, _tos[Number(i)], _value); // [SIMULATED: low-level call]
        }
        return true;
    }
}