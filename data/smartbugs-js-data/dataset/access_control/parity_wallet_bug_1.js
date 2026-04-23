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
  // event Confirmation(address owner, bytes32 operation);
  // event Revoke(address owner, bytes32 operation);

  // some others are in the case of an owner changing.
  // event OwnerChanged(address oldOwner, address newOwner);
  // event OwnerAdded(address newOwner);
  // event OwnerRemoved(address oldOwner);

  // the last one is emitted if the required signatures change
  // event RequirementChanged(uint newRequirement);

  // Funds has arrived into the wallet (record how much).
  // event Deposit(address _from, uint value);
  // Single transaction going out of the wallet (record who signed for it, how much, and to whom it's going).
  // event SingleTransact(address owner, uint value, address to, bytes data, address created);
  // Multi-sig transaction going out of the wallet (record who signed for it last, the operation hash, how much, and to whom it's going).
  // event MultiTransact(address owner, bytes32 operation, uint value, address to, bytes data, address created);
  // Confirmation still needed for a transaction.
  // event ConfirmationNeeded(bytes32 operation, address initiator, uint value, address to, bytes data);
}

class WalletLibrary extends WalletEvents {
  // TYPES

  // struct for the status of a pending operation.
  // struct PendingState {
  //   uint yetNeeded;
  //   uint ownersDone;
  //   uint index;
  // }

  // Transaction structure to remember details of transaction lest it need be saved for a later call.
  // struct Transaction {
  //   address to;
  //   uint value;
  //   bytes data;
  // }

  // MODIFIERS

  // simple single-sig function modifier.
  // modifier onlyowner {
  //   if (isOwner(msg.sender))
  //     _;
  // }
  // multi-sig function modifier: the operation must have an intrinsic hash in order
  // that later attempts can be realised as the same underlying operation and
  // thus count as confirmations.
  // modifier onlymanyowners(bytes32 _operation) {
  //   if (confirmAndCheck(_operation))
  //     _;
  // }

  // METHODS

  // gets called when no other function matches
  fallback(msg_sender, msg_value, msg_data) {
    // just being sent some cash?
    if (msg_value > 0n)
      console.log("Deposit", msg_sender, msg_value);
  }

  // constructor is given number of sigs required to do protected "onlymanyowners" transactions
  // as well as the selection of addresses capable of confirming them.
  initMultiowned(_owners, _required, msg_sender) {
    this.m_numOwners = BigInt(_owners.length) + 1n;
    this.m_owners[1n] = BigInt(msg_sender);
    this.m_ownerIndex[BigInt(msg_sender)] = 1n;
    for (let i = 0n; i < BigInt(_owners.length); ++i)
    {
      this.m_owners[2n + i] = BigInt(_owners[Number(i)]);
      this.m_ownerIndex[BigInt(_owners[Number(i)])] = 2n + i;
    }
    this.m_required = _required;
  }

  // Revokes a prior confirmation of the given operation
  revoke(_operation, msg_sender) {
    let ownerIndex = this.m_ownerIndex[BigInt(msg_sender)];
    // make sure they're an owner
    if (ownerIndex === 0n) return;
    let ownerIndexBit = 2n ** ownerIndex;
    let pending = this.m_pending[_operation];
    if ((pending.ownersDone & ownerIndexBit) > 0n) {
      pending.yetNeeded++;
      pending.ownersDone -= ownerIndexBit;
      console.log("Revoke", msg_sender, _operation);
    }
  }

  // Replaces an owner `_from` with another `_to`.
  changeOwner(_from, _to, msg_sender, msg_data) {
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    if (this.isOwner(_to)) return;
    let ownerIndex = this.m_ownerIndex[BigInt(_from)];
    if (ownerIndex === 0n) return;

    this.clearPending();
    this.m_owners[Number(ownerIndex)] = BigInt(_to);
    this.m_ownerIndex[BigInt(_from)] = 0n;
    this.m_ownerIndex[BigInt(_to)] = ownerIndex;
    console.log("OwnerChanged", _from, _to);
  }

  addOwner(_owner, msg_sender, msg_data) {
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    if (this.isOwner(_owner)) return;

    this.clearPending();
    if (this.m_numOwners >= this.c_maxOwners)
      this.reorganizeOwners();
    if (this.m_numOwners >= this.c_maxOwners)
      return;
    this.m_numOwners++;
    this.m_owners[Number(this.m_numOwners)] = BigInt(_owner);
    this.m_ownerIndex[BigInt(_owner)] = this.m_numOwners;
    console.log("OwnerAdded", _owner);
  }

  removeOwner(_owner, msg_sender, msg_data) {
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    let ownerIndex = this.m_ownerIndex[BigInt(_owner)];
    if (ownerIndex === 0n) return;
    if (this.m_required > this.m_numOwners - 1n) return;

    this.m_owners[Number(ownerIndex)] = 0n;
    this.m_ownerIndex[BigInt(_owner)] = 0n;
    this.clearPending();
    this.reorganizeOwners(); //make sure m_numOwner is equal to the number of owners and always points to the optimal free slot
    console.log("OwnerRemoved", _owner);
  }

  changeRequirement(_newRequired, msg_sender, msg_data) {
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    if (_newRequired > this.m_numOwners) return;
    this.m_required = _newRequired;
    this.clearPending();
    console.log("RequirementChanged", _newRequired);
  }

  // Gets an owner by 0-indexed position (using numOwners as the count)
  getOwner(ownerIndex) {
    return String(this.m_owners[Number(ownerIndex) + 1]);
  }

  isOwner(_addr) {
    return this.m_ownerIndex[BigInt(_addr)] > 0n;
  }

  hasConfirmed(_operation, _owner) {
    let pending = this.m_pending[_operation];
    let ownerIndex = this.m_ownerIndex[BigInt(_owner)];

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
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    this.m_dailyLimit = _newLimit;
  }
  // resets the amount already spent today. needs many of the owners to confirm.
  resetSpentToday(msg_sender, msg_data) {
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    this.m_spentToday = 0n;
  }

  // constructor - just pass on the owner array to the multiowned and
  // the limit to daylimit
  //
  initWallet(_owners, _required, _daylimit, msg_sender) {
    this.initDaylimit(_daylimit);
    this.initMultiowned(_owners, _required, msg_sender);
  }

  // kills the contract sending everything to `_to`.
  kill(_to, msg_sender, msg_data) {
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(sha3(msg_data), msg_sender)) return; // [SIMULATED: onlymanyowners]
    // [SIMULATED: suicide(_to)]
  }

  // Outside-visible transact entry point. Executes transaction immediately if below daily spend limit.
  // If not, goes into multisig process. We provide a hash on return to allow the sender to provide
  // shortcuts for the other confirmations (allowing them to avoid replicating the _to, _value
  // and _data arguments). They still get the option of using them if they want, anyways.
  execute(_to, _value, _data, msg_sender, msg_data, block_number) {
    if (!this.isOwner(msg_sender)) throw new Error("onlyowner");
    // first, take the opportunity to check that we're under the daily limit.
    if ((_data.length === 0 && this.underLimit(_value, msg_sender)) || this.m_required === 1n) {
      // yes - just execute the call.
      let created;
      if (_to === "0x0") {
        created = this.create(_value, _data);
      } else {
        if (!_to.call(_value, _data)) // [SIMULATED: call]
          throw new Error("call failed");
      }
      console.log("SingleTransact", msg_sender, _value, _to, _data, created);
    } else {
      // determine our operation hash.
      let o_hash = sha3(msg_data, block_number);
      // store if it's new
      if (this.m_txs[o_hash].to === "0x0" && this.m_txs[o_hash].value === 0n && this.m_txs[o_hash].data.length === 0) {
        this.m_txs[o_hash].to = _to;
        this.m_txs[o_hash].value = _value;
        this.m_txs[o_hash].data = _data;
      }
      if (!this.confirm(o_hash, msg_sender, msg_data)) {
        console.log("ConfirmationNeeded", o_hash, msg_sender, _value, _to, _data);
      }
    }
  }

  create(_value, _code) {
    // [SIMULATED: assembly create]
  }

  // confirm a transaction through just the hash. we use the previous transactions map, m_txs, in order
  // to determine the body of the transaction from the hash provided.
  confirm(_h, msg_sender, msg_data) {
    if (!this.isOwner(msg_sender)) return; // [SIMULATED: onlyowner]
    if (!this.confirmAndCheck(_h, msg_sender)) return; // [SIMULATED: onlymanyowners]
    if (this.m_txs[_h].to !== "0x0" || this.m_txs[_h].value !== 0n || this.m_txs[_h].data.length !== 0) {
      let created;
      if (this.m_txs[_h].to === "0x0") {
        created = this.create(this.m_txs[_h].value, this.m_txs[_h].data);
      } else {
        if (!this.m_txs[_h].to.call(this.m_txs[_h].value, this.m_txs[_h].data)) // [SIMULATED: call]
          throw new Error("call failed");
      }

      console.log("MultiTransact", msg_sender, _h, this.m_txs[_h].value, this.m_txs[_h].to, this.m_txs[_h].data, created);
      delete this.m_txs[_h];
      return true;
    }
  }

  // INTERNAL METHODS

  confirmAndCheck(_operation, msg_sender) {
    // determine what index the present sender is:
    let ownerIndex = this.m_ownerIndex[BigInt(msg_sender)];
    // make sure they're an owner
    if (ownerIndex === 0n) return;

    let pending = this.m_pending[_operation];
    // if we're not yet working on this operation, switch over and reset the confirmation status.
    if (pending.yetNeeded === 0n) {
      // reset count of confirmations needed.
      pending.yetNeeded = this.m_required;
      // reset which owners have confirmed (none) - set our bitmap to 0.
      pending.ownersDone = 0n;
      pending.index = this.m_pendingIndex.length;
      this.m_pendingIndex.push(_operation); // [SIMULATED: array.length++]
    }
    // determine the bit to set for this owner.
    let ownerIndexBit = 2n ** ownerIndex;
    // make sure we (the message sender) haven't confirmed this operation previously.
    if ((pending.ownersDone & ownerIndexBit) === 0n) {
      console.log("Confirmation", msg_sender, _operation);
      // ok - check if count is enough to go ahead.
      if (pending.yetNeeded <= 1n) {
        // enough confirmations: reset and run interior.
        delete this.m_pendingIndex[Number(this.m_pending[_operation].index)];
        delete this.m_pending[_operation];
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
        this.m_ownerIndex[this.m_owners[Number(free)]] = free;
        this.m_owners[Number(this.m_numOwners)] = 0n;
      }
    }
  }

  // checks to see if there is at least `_value` left from the daily limit today. if there is, subtracts it and
  // returns true. otherwise just returns false.
  underLimit(_value, msg_sender) {
    if (!this.isOwner(msg_sender)) throw new Error("onlyowner");
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
      delete this.m_txs[this.m_pendingIndex[Number(i)]];

      if (this.m_pendingIndex[Number(i)] !== 0n)
        delete this.m_pending[this.m_pendingIndex[Number(i)]];
    }

    this.m_pendingIndex = [];
  }

  // FIELDS
  _walletLibrary = "0xcafecafecafecafecafecafecafecafecafecafe";

  m_required = 0n;
  m_numOwners = 0n;

  m_dailyLimit = 0n;
  m_spentToday = 0n;
  m_lastDay = 0n;

  m_owners = new Array(256).fill(0n);

  c_maxOwners = 250n;
  m_ownerIndex = {};
  m_pending = {};
  m_pendingIndex = [];

  m_txs = {};
}

class Wallet extends WalletEvents {

  // WALLET CONSTRUCTOR
  constructor(_owners, _required, _daylimit) {
    super();
    // [SIMULATED: assembly delegatecall]
  }

  // METHODS

  // gets called when no other function matches
  fallback(msg_sender, msg_value, msg_data) {
    // just being sent some cash?
    if (msg_value > 0n)
      console.log("Deposit", msg_sender, msg_value);
    else if (msg_data.length > 0)
     //
      this._walletLibrary.delegatecall(msg_data); //it should have whitelisted specific methods that the user is allowed to call
  }

  // Gets an owner by 0-indexed position (using numOwners as the count)
  getOwner(ownerIndex) {
    return String(this.m_owners[Number(ownerIndex) + 1]);
  }

  // As return statement unavailable in fallback, explicit the method here

  hasConfirmed(_operation, _owner, msg_data) {
    return this._walletLibrary.delegatecall(msg_data);
  }

  isOwner(_addr, msg_data) {
    return this._walletLibrary.delegatecall(msg_data);
  }

  // FIELDS
  _walletLibrary = "0xcafecafecafecafecafecafecafecafecafecafe";

  m_required = 0n;
  m_numOwners = 0n;

  m_dailyLimit = 0n;
  m_spentToday = 0n;
  m_lastDay = 0n;

  m_owners = new Array(256).fill(0n);
}