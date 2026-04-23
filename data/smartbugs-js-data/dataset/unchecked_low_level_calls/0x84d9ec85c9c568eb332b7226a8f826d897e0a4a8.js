/*



 */

/// @author Bowen Sanders
/// sections built on the work of Jordi Baylina (Owned, data structure)
/// smartwedindex.sol contains a simple index of contract address, couple name, actual marriage date, bool displayValues to
/// be used to create an array of all SmartWed contracts that are deployed 
/// contract 0wned is licesned under GNU-3

/// @dev `Owned` is a base level contract that assigns an `owner` that can be
///  later changed
class Owned {

    /// @dev `owner` is the only address that can call a function with this
    /// modifier
    // [SIMULATED: modifier onlyOwner]

    constructor(msgSender) {
        this.owner = msgSender;
    }

    owner; // [SIMULATED: address]

    /// @notice The Constructor assigns the message sender to be `owner`
    function Owned(msgSender) {
        this.owner = msgSender;
    }

    newOwner; // [SIMULATED: address]

    /// @notice `owner` can step down and assign some other address to this role
    /// @param _newOwner The address of the new owner
    ///  an unowned neutral vault, however that cannot be undone
    function changeOwner(_newOwner, msgSender) {
        if (!(msgSender == this.owner)) throw new Error("...");
        this.newOwner = _newOwner;
    }
    /// @notice `newOwner` has to accept the ownership before it is transferred
    ///  Any account or any contract with the ability to call `acceptOwnership`
    ///  can be used to accept ownership of this contract, including a contract
    ///  with no other functions
    function acceptOwnership(msgSender) {
        if (msgSender == this.newOwner) {
            this.owner = this.newOwner;
        }
    }

    // This is a general safty function that allows the owner to do a lot
    //  of things in the unlikely event that something goes wrong
    // _dst is the contract being called making this like a 1/1 multisig
    function execute(_dst, _value, _data, msgSender) {
        if (!(msgSender == this.owner)) throw new Error("...");
         //
        _dst.call({value: _value, data: _data}); // [SIMULATED: low-level call]
    }
}

// contract WedIndex 

class WedIndex extends Owned {

    // declare index data variables
    wedaddress; // [SIMULATED: string]
    partnernames; // [SIMULATED: string]
    indexdate; // [SIMULATED: BigInt]
    weddingdate; // [SIMULATED: BigInt]
    displaymultisig; // [SIMULATED: BigInt]

    indexarray = []; // [SIMULATED: Array]
    indexarrayLength = 0n; // [SIMULATED: uint length tracking]

    // [SIMULATED: struct IndexArray]
    
    function numberOfIndex() {
        return this.indexarrayLength;
    }


    // make functions to write and read index entries and nubmer of entries
    function writeIndex(indexdate, wedaddress, partnernames, weddingdate, displaymultisig) {
        this.indexarray[Number(this.indexarrayLength)] = {indexdate: 0n, wedaddress: wedaddress, partnernames: partnernames, weddingdate: weddingdate, displaymultisig: displaymultisig}; // [SIMULATED: now]
        this.indexarrayLength = this.indexarrayLength + 1n;
        console.log("IndexWritten", 0n, wedaddress, partnernames, weddingdate, displaymultisig); // [SIMULATED: event]
    }

    // declare events
    // event IndexWritten (uint time, string contractaddress, string partners, uint weddingdate, uint display);
}