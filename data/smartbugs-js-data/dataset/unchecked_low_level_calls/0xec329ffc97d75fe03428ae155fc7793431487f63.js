/*



 */

/* originally >=0.4.11 */

class Owned {
    constructor(msg_sender) {
        this.owner = msg_sender;
    }

    // [SIMULATED: address public owner]
    
    // This contract only defines a modifier and a few useful functions
    // The function body is inserted where the special symbol "_" in the
    // definition of a modifier appears.
    // [SIMULATED: modifier onlyOwner]

    changeOwner(_newOwner, msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");
        this.owner = _newOwner;
    }

    // This is a general safty function that allows the owner to do a lot
    //  of things in the unlikely event that something goes wrong
    // _dst is the contract being called making this like a 1/1 multisig
    execute(_dst, _value, _data, msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");
        //
        // [SIMULATED: _dst.call.value(_value)(_data)]
    }
}
// to get the needed token functions in the contract
// [SIMULATED: contract Token]

class TokenSender extends Owned {
    constructor(_token, msg_sender) {
        super(msg_sender);
        this.token = _token; // the token we are working with
        this.totalToDistribute = 0n;
        this.next = 0n;
        this.transfers = [];
        this.transfers_length = 0n;
    }

    // this is a used to save gas
    // [SIMULATED: uint constant D160]
    get D160() { return 0x0010000000000000000000000000000000000000000n; }

    // This is the function that makes the list of transfers and various
    //  checks around that list, it is a little tricky, the data input is
    //  structured with the `amount` and the (receiving) `addr` combined as one
    //  long number and then this number is deconstructed in this function to
    //  save gas and reduce the number of `0`'s that are needed to be stored
    //   on the blockchain
    fill(data, msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");

        // If the send has started then we just throw
        if (this.next > 0n) throw new Error("throw");

        let acc = 0n;
        let offset = this.transfers_length;
        this.transfers_length = this.transfers_length + BigInt(data.length);
        for (let i = 0n; i < BigInt(data.length); i++ ) {
            let addr = (data[Number(i)] & (this.D160 - 1n)).toString();
            let amount = data[Number(i)] / this.D160;

            this.transfers[Number(offset + i)] = { addr: addr, amount: amount };
            acc += amount;
        }
        this.totalToDistribute += acc;
    }
    // This function actually makes the sends and tracks the amount of gas used
    //  if it takes more gas than was sent with the transaction then this
    //  function will need to be called a few times until
    run(msg_sender) {
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");
        if (this.transfers_length === 0n) return;

        // Keep next in the stack var mNext to save gas
        let mNext = this.next;

        // Set the contract as finalized to avoid reentrance
        this.next = this.transfers_length;

        if ((mNext === 0n) && (this.token.balanceOf(this) !== this.totalToDistribute)) throw new Error("throw");

        while ((mNext < this.transfers_length) && (this.gas() > 150000n)) {
            let amount = this.transfers[Number(mNext)].amount;
            let addr = this.transfers[Number(mNext)].addr;
            if (amount > 0n) {
                if (!this.token.transfer(addr, this.transfers[Number(mNext)].amount)) throw new Error("throw");
            }
            mNext ++;
        }

        // Set the next to the actual state.
        this.next = mNext;
    }


    ///////////////////////
    // Helper functions
    ///////////////////////

    hasTerminated() {
        if (this.transfers_length === 0n) return false;
        if (this.next < this.transfers_length) return false;
        return true;
    }

    nTransfers() {
        return this.transfers_length;
    }

    gas() {
        // [SIMULATED: assembly { _gas:= gas }]
        return 200000n;
    }

}