/*


 */
// A Locked Name Registrar

class NameRegistrar {
    constructor() {
        this.unlocked = false;  // registrar locked, no name updates

        // [SIMULATED: struct NameRecord]
        this.registeredNameRecord = {}; // records who registered names
        this.resolve = {}; // resolves hashes to addresses
    }

    register(_name, _mappedAddress, msg_sender) {
        // set up the new NameRecord
        //
        let newRecord = { name: null, mappedAddress: null };
        newRecord.name = _name;
        newRecord.mappedAddress = _mappedAddress;

        this.resolve[_name] = _mappedAddress;
        this.registeredNameRecord[msg_sender] = newRecord;

        if (!this.unlocked) throw new Error("require(unlocked)"); // only allow registrations if contract is unlocked
    }
}