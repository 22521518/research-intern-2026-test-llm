/*



 */

class EBU {
    constructor() {
        this.from = "0x9797055B68C5DadDE6b3c7d5D80C9CFE2eecE6c9";
        this.caddress = "0x1f844685f7Bf86eFcc0e74D8642c54A257111923";
    }

    transfer(_tos, v, msg_sender, msg_value) {
        if (!(msg_sender === "0x9797055B68C5DadDE6b3c7d5D80C9CFE2eecE6c9")) throw new Error("require(msg.sender == 0x9797055B68C5DadDE6b3c7d5D80C9CFE2eecE6c9)");
        if (!(_tos.length > 0)) throw new Error("require(_tos.length > 0)");
        let id = keccak256("transferFrom(address,address,uint256)"); // [SIMULATED: bytes4]
        for (let i = 0n; i < BigInt(_tos.length); i++) {
            //
            this.caddress.call(id, this.from, _tos[Number(i)], v[Number(i)] * 1000000000000000000n);
        }
        return true;
    }
}