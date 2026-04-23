/*



 */

// A chain-game contract that maintains a 'throne' which agents may pay to rule.
// See www.kingoftheether.com & https://github.com/kieranelby/KingOfTheEtherThrone .
// (c) Kieran Elby 2016. All rights reserved.
// v0.4.0.
// Inspired by ethereumpyramid.com and the (now-gone?) "magnificent bitcoin gem".

// This contract lives on the blockchain at 0xb336a86e2feb1e87a328fcb7dd4d04de3df254d0
// and was compiled (using optimization) with:
// Solidity version: 0.2.1-fad2d4df/.-Emscripten/clang/int linked to libethereum

// For future versions it would be nice to ...
// TODO - enforce time-limit on reign (can contracts do that without external action)?
// TODO - add a random reset?
// TODO - add bitcoin bridge so agents can pay in bitcoin?
// TODO - maybe allow different return payment address?

//added pragma version
// [SIMULATED: pragma solidity ^0.4.0;]

class KingOfTheEtherThrone {

    constructor() {
        this.pastMonarchs = [];
        this.pastMonarchsLength = 0n; // [SIMULATED: manual length tracking]
        this.startingClaimPrice = 100000000000000000n; // 100 finney
        this.claimPriceAdjustNum = 3n;
        this.claimPriceAdjustDen = 2n;
        this.wizardCommissionFractionNum = 1n;
        this.wizardCommissionFractionDen = 100n;
    }

    // The wizard is the hidden power behind the throne; they
    // occupy the throne during gaps in succession and collect fees.
    // address wizardAddress;

    // Used to ensure only the wizard can do some things.
    // modifier onlywizard { if (msg.sender == wizardAddress) _; }

    // How much must the first monarch pay?
    // uint constant startingClaimPrice = 100 finney;

    // The next claimPrice is calculated from the previous claimFee
    // by multiplying by claimFeeAdjustNum and dividing by claimFeeAdjustDen -
    // for example, num=3 and den=2 would cause a 50% increase.
    // uint constant claimPriceAdjustNum = 3;
    // uint constant claimPriceAdjustDen = 2;

    // How much of each claimFee goes to the wizard (expressed as a fraction)?
    // e.g. num=1 and den=100 would deduct 1% for the wizard, leaving 99% as
    // the compensation fee for the usurped monarch.
    // uint constant wizardCommissionFractionNum = 1;
    // uint constant wizardCommissionFractionDen = 100;

    // How much must an agent pay now to become the monarch?
    // uint public currentClaimPrice;

    // The King (or Queen) of the Ether.
    // Monarch public currentMonarch;

    // Earliest-first list of previous throne holders.
    // Monarch[] public pastMonarchs;

    // Create a new throne, with the creator as wizard and first ruler.
    // Sets up some hopefully sensible defaults.
    init(msg_sender, block_timestamp) {
        this.wizardAddress = msg_sender;
        this.currentClaimPrice = this.startingClaimPrice;
        this.currentMonarch = {
            etherAddress: this.wizardAddress,
            name: "[Vacant]",
            claimPrice: 0n,
            coronationTimestamp: block_timestamp
        };
    }

    numberOfMonarchs() {
        return this.pastMonarchsLength;
    }

    // Fired when the throne is claimed.
    // In theory can be used to help build a front-end.
    // event ThroneClaimed(
    //     address usurperEtherAddress,
    //     string usurperName,
    //     uint newClaimPrice
    // );

    // Fallback function - simple transactions trigger this.
    // Assume the message data is their desired name.
    fallback(msg_data, msg_sender, msg_value, block_timestamp) {
        this.claimThrone(msg_data, msg_sender, msg_value, block_timestamp);
    }

    // Claim the throne for the given name by paying the currentClaimFee.
    claimThrone(name, msg_sender, msg_value, block_timestamp) {

        let valuePaid = msg_value;

        // If they paid too little, reject claim and refund their money.
        if (valuePaid < this.currentClaimPrice) {
            //
            // [SIMULATED: msg.sender.send(valuePaid)]
            return;
        }

        // If they paid too much, continue with claim but refund the excess.
        if (valuePaid > this.currentClaimPrice) {
            let excessPaid = valuePaid - this.currentClaimPrice;
            //
            // [SIMULATED: msg.sender.send(excessPaid)]
            valuePaid = valuePaid - excessPaid;
        }

        // The claim price payment goes to the current monarch as compensation
        // (with a commission held back for the wizard). We let the wizard's
        // payments accumulate to avoid wasting gas sending small fees.

        let wizardCommission = (valuePaid * this.wizardCommissionFractionNum) / this.wizardCommissionFractionDen;

        let compensation = valuePaid - wizardCommission;

        if (this.currentMonarch.etherAddress != this.wizardAddress) {
            //
            // [SIMULATED: currentMonarch.etherAddress.send(compensation)]
        } else {
            // When the throne is vacant, the fee accumulates for the wizard.
        }

        // Usurp the current monarch, replacing them with the new one.
        this.pastMonarchs[Number(this.pastMonarchsLength)] = this.currentMonarch;
        this.pastMonarchsLength++;
        this.currentMonarch = {
            etherAddress: msg_sender,
            name: name,
            claimPrice: valuePaid,
            coronationTimestamp: block_timestamp
        };

        // Increase the claim fee for next time.
        // Stop number of trailing decimals getting silly - we round it a bit.
        let rawNewClaimPrice = this.currentClaimPrice * this.claimPriceAdjustNum / this.claimPriceAdjustDen;
        if (rawNewClaimPrice < 10000000000000000n) {
            this.currentClaimPrice = rawNewClaimPrice;
        } else if (rawNewClaimPrice < 100000000000000000n) {
            this.currentClaimPrice = 1000000000000n * (rawNewClaimPrice / 1000000000000n);
        } else if (rawNewClaimPrice < 1000000000000000000n) {
            this.currentClaimPrice = 1000000000000000n * (rawNewClaimPrice / 1000000000000000n);
        } else if (rawNewClaimPrice < 10000000000000000000n) {
            this.currentClaimPrice = 10000000000000000n * (rawNewClaimPrice / 10000000000000000n);
        } else if (rawNewClaimPrice < 100000000000000000000n) {
            this.currentClaimPrice = 100000000000000000n * (rawNewClaimPrice / 100000000000000000n);
        } else if (rawNewClaimPrice < 1000000000000000000000n) {
            this.currentClaimPrice = 1000000000000000000n * (rawNewClaimPrice / 1000000000000000000n);
        } else if (rawNewClaimPrice < 10000000000000000000000n) {
            this.currentClaimPrice = 10000000000000000000n * (rawNewClaimPrice / 10000000000000000000n);
        } else {
            this.currentClaimPrice = rawNewClaimPrice;
        }

        // Hail the new monarch!
        console.log("ThroneClaimed", this.currentMonarch.etherAddress, this.currentMonarch.name, this.currentClaimPrice);
    }

    // Used only by the wizard to collect his commission.
    sweepCommission(amount, msg_sender) {
        if (!(msg_sender == this.wizardAddress)) throw new Error("onlywizard");
        //
        // [SIMULATED: wizardAddress.send(amount)]
    }

    // Used only by the wizard to collect his commission.
    transferOwnership(newOwner, msg_sender) {
        if (!(msg_sender == this.wizardAddress)) throw new Error("onlywizard");
        this.wizardAddress = newOwner;
    }

}