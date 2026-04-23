/*




 */

 //added pragma version
// [SIMULATED: pragma solidity ^0.4.0;]

 class LuckyDoubler {
//##########################################################
//#### LuckyDoubler: A doubler with random payout order ####
//#### Deposit 1 ETHER to participate                   ####
//##########################################################
//COPYRIGHT 2016 KATATSUKI ALL RIGHTS RESERVED
//No part of this source code may be reproduced, distributed,
//modified or transmitted in any form or by any means without
//the prior written permission of the creator.

    constructor(msg_sender) {
        this.owner = msg_sender;
    }

    owner;

    //Stored variables
    balance = 0n;
    fee = 5n;
    multiplier = 125n;

    users = {}; // [SIMULATED: mapping]
    entries = [];
    unpaidEntries = [];
    unpaidEntriesLength = 0n;

    //Set owner on contract creation
    function LuckyDoubler(msg_sender) {
        this.owner = msg_sender;
    }

    // [SIMULATED: modifier onlyowner]

    // [SIMULATED: struct User]

    // [SIMULATED: struct Entry]

    //Fallback function
    function fallback(msg_sender, msg_value) {
        this.init(msg_sender, msg_value);
    }

    function init(msg_sender, msg_value) {

        if (msg_value < 1000000000000000000n) {
             // [SIMULATED: msg.sender.send(msg.value)]
            return;
        }

        this.join(msg_sender, msg_value);
    }

    function join(msg_sender, msg_value) {

        //Limit deposits to 1ETH
        let dValue = 1000000000000000000n;

        if (msg_value > 1000000000000000000n) {

        	// [SIMULATED: msg.sender.send(msg.value - 1 ether)]
        	dValue = 1000000000000000000n;
        }

        //Add new users to the users array
        if (this.users[msg_sender] === undefined || this.users[msg_sender].id == "0x0")
        {
            this.users[msg_sender] = {id: msg_sender, deposits: 0n, payoutsReceived: 0n};
        }

        //Add new entry to the entries array
        this.entries.push({entryAddress: msg_sender, deposit: dValue, payout: (dValue * (this.multiplier) / 100n), paid: false});
        this.users[msg_sender].deposits++;
        this.unpaidEntries[Number(this.unpaidEntriesLength)] = BigInt(this.entries.length - 1);
        this.unpaidEntriesLength++;

        //Collect fees and update contract balance
        this.balance += (dValue * (100n - this.fee)) / 100n;

        let index = this.unpaidEntriesLength > 1n ? this.rand(this.unpaidEntriesLength) : 0n;
        let theEntry = this.entries[Number(this.unpaidEntries[Number(index)])];

        //Pay pending entries if the new balance allows for it
        if (this.balance > theEntry.payout) {

            let payout = theEntry.payout;

            // [SIMULATED: theEntry.entryAddress.send(payout)]
            theEntry.paid = true;
            this.users[theEntry.entryAddress].payoutsReceived++;

            this.balance -= payout;

            if (index < this.unpaidEntriesLength - 1n)
                this.unpaidEntries[Number(index)] = this.unpaidEntries[Number(this.unpaidEntriesLength - 1n)];

            if (this.unpaidEntriesLength === 0n) this.unpaidEntriesLength = 1157920892373161954235709850086879078532699846656405640394575840079131296399n; else this.unpaidEntriesLength--;

        }

        //Collect money from fees and possible leftovers from errors (actual balance untouched)
        let fees = this.balance - this.balance; // [SIMULATED: this.balance - balance]
        if (fees > 0n)
        {
                // [SIMULATED: owner.send(fees)]
        }

    }

    //Generate random number between 0 & max
    FACTOR =  1157920892373161954235709850086879078532699846656405640394575840079131296399n;
    //
    function rand(max) {
        let factor = this.FACTOR * 100n / max;
        let lastBlockNumber = 0n; // [SIMULATED: block.number - 1]
        let hashVal = 0n; // [SIMULATED: block.blockhash(lastBlockNumber)]

        return ((hashVal) / factor) % max;
    }


    //Contract management
    function changeOwner(newOwner, msg_sender) {
        if (!(msg_sender == this.owner)) return;
        this.owner = newOwner;
    }

    function changeMultiplier(multi, msg_sender) {
        if (!(msg_sender == this.owner)) return;
        if (multi < 110n || multi > 150n) throw new Error("");

        this.multiplier = multi;
    }

    function changeFee(newFee, msg_sender) {
        if (!(msg_sender == this.owner)) return;
        if (this.fee > 5n)
            throw new Error("");
        this.fee = newFee;
    }


    //JSON functions
    function multiplierFactor() {
        let factor = this.multiplier;
        let info = 'The current multiplier applied to all deposits. Min 110%, max 150%.';
        return {factor, info};
    }

    function currentFee() {
        let feePercentage = this.fee;
        let info = 'The fee percentage applied to all deposits. It can change to speed payouts (max 5%).';
        return {feePercentage, info};
    }

    function totalEntries() {
        let count = BigInt(this.entries.length);
        let info = 'The number of deposits.';
        return {count, info};
    }

    function userStats(user)
    {
        if (this.users[user] !== undefined && this.users[user].id != "0x0")
        {
            let deposits = this.users[user].deposits;
            let payouts = this.users[user].payoutsReceived;
            let info = 'Users stats: total deposits, payouts received.';
            return {deposits, payouts, info};
        }
    }

    function entryDetails(index)
    {
        if (index < BigInt(this.entries.length)) {
            let user = this.entries[Number(index)].entryAddress;
            let payout = this.entries[Number(index)].payout / 1000000000000000n;
            let paid = this.entries[Number(index)].paid;
            let info = 'Entry info: user address, expected payout in Finneys, payout status.';
            return {user, payout, paid, info};
        }
    }


}