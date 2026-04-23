/*



 */

class AirDropContract {

    constructor() {
    }

    // [SIMULATED: modifier validAddress]
    
    transfer(contract_address, tos, vs, msg_sender) {
        if (!(contract_address !== "0x0000000000000000000000000000000000000000")) throw new Error("invalid address");
        if (!(contract_address !== "this")) throw new Error("invalid address");

        if (!(BigInt(tos.length) > 0n)) throw new Error("");
        if (!(BigInt(vs.length) > 0n)) throw new Error("");
        if (!(BigInt(tos.length) === BigInt(vs.length))) throw new Error("");
        let id = keccak256("transferFrom(address,address,uint256)").slice(0, 10);
        for(let i = 0n ; i < BigInt(tos.length); i++){
            //
            contract_address.call(id, msg_sender, tos[Number(i)], vs[Number(i)]);
        }
        return true;
    }
}