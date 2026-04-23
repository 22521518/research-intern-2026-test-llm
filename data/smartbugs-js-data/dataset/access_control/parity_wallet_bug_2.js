/*



 */

//sol Wallet
// Multi-sig, daily-limited account proxy/wallet.
// @authors:
// Gav Wood <g@ethdev.com>
// inheritable "property" contract that enables methods to be protected by requiring the acquiescence of either a
// single, or, crucially, each of a number of, designated owners.
// usage:
// use modifiers onlyowner (just own owned) or onlymanyowners(hash), whereby the same hash must be provided by
// some number (specified in constructor) of the set of owners (specified in the constructor, modifiable) before the
// interior is executed.

class WalletEvents {
  // EVENTS

  // this contract only has six types of events: it can accept a confirmation, in which case
  // we record owner and operation (hash) alongside it.
  Confirmation(owner, operation) { console.log("Confirmation", owner, operation); }
  Revoke(owner, operation) { console.log("Revoke", owner, operation); }

  // some others are in the case of an owner changing.
  OwnerChanged(oldOwner, newOwner) { console.log("OwnerChanged", oldOwner, newOwner); }
  OwnerAdded(newOwner) { console.log("OwnerAdded", newOwner); }
  OwnerRemoved(oldOwner) { console.log("OwnerRemoved", oldOwner); }

  // the last one is emitted if the required signatures change
  RequirementChanged(newRequirement) { console.log("RequirementChanged", newRequirement); }

  // Funds has arrived into the wallet (record how much).
  Deposit(_from, value) { console.log("Deposit", _from, value); }
  // Single transaction going out of the wallet (record who signed for it, how much, and to whom it's going).
  SingleTransact(owner, value, to, data, created) { console.log("SingleTransact", owner, value, to, data, created); }
  // Multi-sig transaction going out of the wallet (record who signed for it last, the operation hash, how much, and to whom it's going).
  MultiTransact(owner, operation, value, to, data, created) { console.log("MultiTransact", owner, operation, value, to, data, created); }
  // Confirmation still needed for a transaction.
  ConfirmationNeeded(operation, initiator, value, to, data) { console.log("ConfirmationNeeded", operation, initiator, value, to, data); }
}

class WalletLibrary extends WalletEvents {
  constructor() {
    super();
    this.m_required = 0n;
    this.m_numOwners = 0n;
    this.m_dailyLimit = 0n;
    this.m_spentToday = 0n;
    this.m_lastDay = 0n;
    this.m_owners = new Array(256).fill(0n);
    this.c_maxOwners = 250n;
    this.m_ownerIndex = new Map();
    this.m_pending = new Map();
    this.m_pendingIndex = [];
    this.m_txs = new Map();
  }

  // METHODS

  // gets called when no other function matches
  fallback(msg_sender, msg_value) {
    // just being sent some cash?
    if (msg_value > 0n)
      this.Deposit(msg_sender, msg_value);
  }

  // constructor is given number of sigs required to do protected "onlymanyowners" transactions
  // as well as the selection of addresses capable of confirming them.
  initMultiowned(_owners, _required, msg_sender) {
    if (this.m_numOwners > 0n) throw new Error("Already initialized"); // [SIMULATED: only_uninitialized]
    this.m_numOwners = BigInt(_owners.length) + 1n;
    this.m_owners[Number(1n)] = BigInt(msg_sender);
    this.m_ownerIndex.set(BigInt(msg_sender), 1n);
    for (let i = 0n; i < BigInt(_owners.length); ++i)
    {
      this.m_owners[Number(2n + i)] = BigInt(_owners[Number(i)]);
      this.m_ownerIndex.set(BigInt(_owners[Number(i)]), 2n + i);
    }
    this.m_required = _required;
  }

  // Revokes a prior confirmation of the given operation
  revoke(_operation, msg_sender) {
    let ownerIndex = this.m_ownerIndex.get(BigInt(msg_sender)) || 0n;
    // make sure they're an owner
    if (ownerIndex === 0n) return;
    let ownerIndexBit = 2n ** ownerIndex;
    let pending = this.m_pending.get(_operation);
    if (pending && (pending.ownersDone & ownerIndexBit) > 0n) {
      pending.yetNeeded++;
      pending.ownersDone -= ownerIndexBit;
      this.Revoke(msg_sender, _operation);
    }
  }

  // Replaces an owner `_from` with another `_to`.
  changeOwner(_from, _to, msg_sender, msg_data) {
    if (!this.confirmAndCheck(this.sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    if (this.isOwner(_to)) return;
    let ownerIndex = this.m_ownerIndex.get(BigInt(_from)) || 0n;
    if (ownerIndex === 0n) return;

    this.clearPending();
    this.m_owners[Number(ownerIndex)] = BigInt(_to);
    this.m_ownerIndex.set(BigInt(_from), 0n);
    this.m_ownerIndex.set(BigInt(_to), ownerIndex);
    this.OwnerChanged(_from, _to);
  }

  addOwner(_owner, msg_sender, msg_data) {
    if (!this.confirmAndCheck(this.sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    if (this.isOwner(_owner)) return;

    this.clearPending();
    if (this.m_numOwners >= this.c_maxOwners)
      this.reorganizeOwners();
    if (this.m_numOwners >= this.c_maxOwners)
      return;
    this.m_numOwners++;
    this.m_owners[Number(this.m_numOwners)] = BigInt(_owner);
    this.m_ownerIndex.set(BigInt(_owner), this.m_numOwners);
    this.OwnerAdded(_owner);
  }

  removeOwner(_owner, msg_sender, msg_data) {
    if (!this.confirmAndCheck(this.sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    let ownerIndex = this.m_ownerIndex.get(BigInt(_owner)) || 0n;
    if (ownerIndex === 0n) return;
    if (this.m_required > this.m_numOwners - 1n) return;

    this.m_owners[Number(ownerIndex)] = 0n;
    this.m_ownerIndex.set(BigInt(_owner), 0n);
    this.clearPending();
    this.reorganizeOwners(); //make sure m_numOwner is equal to the number of owners and always points to the optimal free slot
    this.OwnerRemoved(_owner);
  }

  changeRequirement(_newRequired, msg_sender, msg_data) {
    if (!this.confirmAndCheck(this.sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    if (_newRequired > this.m_numOwners) return;
    this.m_required = _newRequired;
    this.clearPending();
    this.RequirementChanged(_newRequired);
  }

  // Gets an owner by 0-indexed position (using numOwners as the count)
  getOwner(ownerIndex) {
    return String(this.m_owners[Number(ownerIndex + 1n)]);
  }

  isOwner(_addr) {
    return (this.m_ownerIndex.get(BigInt(_addr)) || 0n) > 0n;
  }

  hasConfirmed(_operation, _owner) {
    let pending = this.m_pending.get(_operation);
    let ownerIndex = this.m_ownerIndex.get(BigInt(_owner)) || 0n;

    // make sure they're an owner
    if (ownerIndex === 0n) return false;

    // determine the bit to set for this owner.
    let ownerIndexBit = 2n ** ownerIndex;
    return !( (pending.ownersDone & ownerIndexBit) === 0n);
  }

  // constructor - stores initial daily limit and records the present day's index.
  initDaylimit(_limit) {
    this.m_dailyLimit = _limit;
    this.m_lastDay = this.today();
  }
  // (re)sets the daily limit. needs many of the owners to confirm. doesn't alter the amount already spent today.
  setDailyLimit(_newLimit, msg_sender, msg_data) {
    if (!this.confirmAndCheck(this.sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    this.m_dailyLimit = _newLimit;
  }
  // resets the amount already spent today. needs many of the owners to confirm.
  resetSpentToday(msg_sender, msg_data) {
    if (!this.confirmAndCheck(this.sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    this.m_spentToday = 0n;
  }

  // constructor - just pass on the owner array to the multiowned and
  // the limit to daylimit
  //
  initWallet(_owners, _required, _daylimit, msg_sender) {
    if (this.m_numOwners > 0n) throw new Error("Already initialized"); // [SIMULATED: only_uninitialized]
    this.initDaylimit(_daylimit);
    this.initMultiowned(_owners, _required, msg_sender);
  }

  // kills the contract sending everything to `_to`.
  //
  kill(_to, msg_sender, msg_data) {
    if (!this.confirmAndCheck(this.sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    // [SIMULATED: suicide(_to)]
  }

  execute(_to, _value, _data, msg_sender, block_number) {
    if (!this.isOwner(msg_sender)) throw new Error("Not owner"); // [SIMULATED: onlyowner]
    // first, take the opportunity to check that we're under the daily limit.
    if ((_data.length === 0 && this.underLimit(_value)) || this.m_required === 1n) {
      // yes - just execute the call.
      let created = "0x0";
      if (_to === "0x0") {
        created = this.create(_value, _data);
      } else {
        // [SIMULATED: _to.call.value(_value)(_data)]
      }
      this.SingleTransact(msg_sender, _value, _to, _data, created);
    } else {
      // determine our operation hash.
      let o_hash = this.sha3(msg_sender + _value + _to + _data + block_number);
      // store if it's new
      let tx = this.m_txs.get(o_hash) || {to: "0x0", value: 0n, data: ""};
      if (tx.to === "0x0" && tx.value === 0n && tx.data.length === 0) {
        this.m_txs.set(o_hash, {to: _to, value: _value, data: _data});
      }
      if (!this.confirm(o_hash, msg_sender)) {
        this.ConfirmationNeeded(o_hash, msg_sender, _value, _to, _data);
      }
      return o_hash;
    }
  }

  create(_value, _code) {
    /*
    assembly {
      o_addr := create(_value, add(_code, 0x20), mload(_code))
      jumpi(invalidJumpLabel, iszero(extcodesize(o_addr)))
    }
    */
  }

  // confirm a transaction through just the hash. we use the previous transactions map, m_txs, in order
  // to determine the body of the transaction from the hash provided.
  confirm(_h, msg_sender) {
    if (!this.confirmAndCheck(_h, msg_sender)) return; // [SIMULATED: onlymanyowners]
    let tx = this.m_txs.get(_h);
    if (tx && (tx.to !== "0x0" || tx.value !== 0n || tx.data.length !== 0)) {
      let created = "0x0";
      if (tx.to === "0x0") {
        created = this.create(tx.value, tx.data);
      } else {
        // [SIMULATED: tx.to.call.value(tx.value)(tx.data)]
      }

      this.MultiTransact(msg_sender, _h, tx.value, tx.to, tx.data, created);
      this.m_txs.delete(_h);
      return true;
    }
  }

  // INTERNAL METHODS

  confirmAndCheck(_operation, msg_sender) {
    // determine what index the present sender is:
    let ownerIndex = this.m_ownerIndex.get(BigInt(msg_sender)) || 0n;
    // make sure they're an owner
    if (ownerIndex === 0n) return;

    let pending = this.m_pending.get(_operation) || {yetNeeded: 0n, ownersDone: 0n, index: 0n};
    // if we're not yet working on this operation, switch over and reset the confirmation status.
    if (pending.yetNeeded === 0n) {
      // reset count of confirmations needed.
      pending.yetNeeded = this.m_required;
      // reset which owners have confirmed (none) - set our bitmap to 0.
      pending.ownersDone = 0n;
      pending.index = BigInt(this.m_pendingIndex.length);
      this.m_pendingIndex.push(_operation);
      this.m_pending.set(_operation, pending);
    }
    // determine the bit to set for this owner.
    let ownerIndexBit = 2n ** ownerIndex;
    // make sure we (the message sender) haven't confirmed this operation previously.
    if ((pending.ownersDone & ownerIndexBit) === 0n) {
      this.Confirmation(msg_sender, _operation);
      // ok - check if count is enough to go ahead.
      if (pending.yetNeeded <= 1n) {
        // enough confirmations: reset and run interior.
        this.m_pendingIndex.splice(Number(this.m_pending.get(_operation).index), 1);
        this.m_pending.delete(_operation);
        return true;
      }
      else
      {
        // not enough: record that this owner in particular confirmed.
        pending.yetNeeded--;
        pending.ownersDone |= ownerIndexBit;
      }
    }
  }

  reorganizeOwners() {
    let free = 1n;
    while (free < this.m_numOwners)
    {
      while (free < this.m_numOwners && this.m_owners[Number(free)] !== 0n) free++;
      while (this.m_numOwners > 1n && this.m_owners[Number(this.m_numOwners)] === 0n) this.m_numOwners--;
      if (free < this.m_numOwners && this.m_owners[Number(this.m_numOwners)] !== 0n && this.m_owners[Number(free)] === 0n)
      {
        this.m_owners[Number(free)] = this.m_owners[Number(this.m_numOwners)];
        this.m_ownerIndex.set(this.m_owners[Number(free)], free);
        this.m_owners[Number(this.m_numOwners)] = 0n;
      }
    }
  }

  // checks to see if there is at least `_value` left from the daily limit today. if there is, subtracts it and
  // returns true. otherwise just returns false.
  underLimit(_value) {
    // reset the spend limit if we're on a different day to last time.
    if (this.today() > this.m_lastDay) {
      this.m_spentToday = 0n;
      this.m_lastDay = this.today();
    }
    // check to see if there's enough left - if so, subtract and return true.
    // overflow protection                    // dailyLimit check
    if (this.m_spentToday + _value >= this.m_spentToday && this.m_spentToday + _value <= this.m_dailyLimit) {
      this.m_spentToday += _value;
      return true;
    }
    return false;
  }

  // determines today's index.
  today() { return BigInt(Math.floor(Date.now() / 86400000)); }

  clearPending() {
    let length = BigInt(this.m_pendingIndex.length);

    for (let i = 0n; i < length; ++i) {
      this.m_txs.delete(this.m_pendingIndex[Number(i)]);

      if (this.m_pendingIndex[Number(i)] !== "0x0")
        this.m_pending.delete(this.m_pendingIndex[Number(i)]);
    }

    this.m_pendingIndex = [];
  }

  sha3(data) { return "0x" + data.toString(); } // [SIMULATED: sha3]
}