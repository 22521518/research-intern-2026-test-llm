/*



 */

// [SIMULATED: pragma solidity ^0.4.16;]

/// @author Jordi Baylina
/// Auditors: Griff Green & psdev
/// @notice Based on http://hudsonjameson.com/ethereummarriage/
/// License: GNU-3

/// @dev `Owned` is a base level contract that assigns an `owner` that can be
///  later changed
class Owned {

    /// @dev `owner` is the only address that can call a function with this
    /// modifier
    // [SIMULATED: modifier onlyOwner()]

    owner; // address

    /// @notice The Constructor assigns the message sender to be `owner`
    constructor(msg_sender) {
        this.owner = msg_sender;
    }

    newOwner; // address

    /// @notice `owner` can step down and assign some other address to this role
    /// @param _newOwner The address of the new owner
    ///  an unowned neutral vault, however that cannot be undone
    changeOwner(_newOwner, msg_sender) {
        if (!(msg_sender == this.owner)) throw new Error("require");
        this.newOwner = _newOwner;
    }
    /// @notice `newOwner` has to accept the ownership before it is transferred
    ///  Any account or any contract with the ability to call `acceptOwnership`
    ///  can be used to accept ownership of this contract, including a contract
    ///  with no other functions
    acceptOwnership(msg_sender) {
        if (msg_sender == this.newOwner) {
            this.owner = this.newOwner;
        }
    }

    // This is a general safty function that allows the owner to do a lot
    //  of things in the unlikely event that something goes wrong
    // _dst is the contract being called making this like a 1/1 multisig
    execute(_dst, _value, _data, msg_sender) {
        if (!(msg_sender == this.owner)) throw new Error("require");
         //
        // [SIMULATED: _dst.call.value(_value)(_data);]
    }
}


class Marriage extends Owned
{
    // Marriage data variables
    partner1; // string
    partner2; // string
    marriageDate; // uint
    marriageStatus; // string
    vows; // string

    majorEvents = []; // Event[]
    majorEventsLength = 0n; // [SIMULATED: uint]
    messages = []; // Message[]
    messagesLength = 0n; // [SIMULATED: uint]

    // [SIMULATED: struct Event]
    // [SIMULATED: struct Message]

    // [SIMULATED: modifier areMarried]

    //Set Owner
    constructor(_owner) {
        super(_owner);
        this.owner = _owner;
    }

    numberOfMajorEvents() {
        return this.majorEventsLength;
    }

    numberOfMessages() {
        return this.messagesLength;
    }

    // Create initial marriage contract
    createMarriage(
        _partner1,
        _partner2,
        _vows,
        url, msg_sender, now)
    {
        if (!(msg_sender == this.owner)) throw new Error("require");
        if (!(this.majorEventsLength == 0n)) throw new Error("require");
        this.partner1 = _partner1;
        this.partner2 = _partner2;
        this.marriageDate = now;
        this.vows = _vows;
        this.marriageStatus = "Married";
        this.majorEvents[Number(this.majorEventsLength)] = {date: now, name: "Marriage", description: this.vows, url: url};
        this.majorEventsLength++;
        console.log("MajorEvent", "Marrigage", this.vows, url);
    }

    // Set the marriage status if it changes
    setStatus(status, url, msg_sender)
    {
        if (!(msg_sender == this.owner)) throw new Error("require");
        this.marriageStatus = status;
        this.setMajorEvent("Changed Status", status, url, msg_sender);
    }

    // Set the IPFS hash of the image of the couple
    setMajorEvent(name, description, url, msg_sender)
    {
        if (!(msg_sender == this.owner)) throw new Error("require");
        // [SIMULATED: require(sha3(marriageStatus) == sha3("Married"));]
        this.majorEvents[Number(this.majorEventsLength)] = {date: 0n, name: name, description: description, url: url}; // [SIMULATED: now]
        this.majorEventsLength++;
        console.log("MajorEvent", name, description, url);
    }

    sendMessage(nameFrom, text, url, msg_sender, msg_value, now) {
        // [SIMULATED: require(sha3(marriageStatus) == sha3("Married"));]
        if (msg_value > 0n) {
            // [SIMULATED: owner.transfer(this.balance);]
        }
        this.messages[Number(this.messagesLength)] = {date: now, nameFrom: nameFrom, text: text, url: url, value: msg_value};
        this.messagesLength++;
        console.log("MessageSent", nameFrom, text, url, msg_value);
    }


    // Declare event structure
    // [SIMULATED: event MajorEvent(string name, string description, string url);]
    // [SIMULATED: event MessageSent(string name, string description, string url, uint value);]
}