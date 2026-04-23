/*



 */

class SafeMath {
  static mul(a, b) {
    let c = a * b;
    if (!(a === 0n || c / a === b)) throw new Error("SafeMath: multiplication overflow");
    return c;
  }

  static div(a, b) {
    // require(b > 0); // Solidity automatically throws when dividing by 0
    let c = a / b;
    // require(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  static sub(a, b) {
    if (!(b <= a)) throw new Error("SafeMath: subtraction overflow");
    return a - b;
  }

  static add(a, b) {
    let c = a + b;
    if (!(c >= a)) throw new Error("SafeMath: addition overflow");
    return c;
  }
}

class ERC20Basic {
  constructor() {
    this.totalSupply = 0n;
  }
  // [SIMULATED: interface]
}

class BasicToken extends ERC20Basic {
  constructor() {
    super();
    this.balances = {};
  }

  transfer(_to, _value, msg_sender) {
    if (!(_to !== "0x0000000000000000000000000000000000000000")) throw new Error("Invalid address");
    if (!(_value > 0n && _value <= (this.balances[msg_sender] || 0n))) throw new Error("Invalid value or insufficient balance");

    // SafeMath.sub will throw if there is not enough balance.
    this.balances[msg_sender] = SafeMath.sub(this.balances[msg_sender], _value);
    this.balances[_to] = SafeMath.add((this.balances[_to] || 0n), _value);
    console.log("Transfer", msg_sender, _to, _value);
    return true;
  }

  balanceOf(_owner) {
    return this.balances[_owner] || 0n;
  }
}

class ERC20 extends ERC20Basic {
  // [SIMULATED: interface]
}

class StandardToken extends BasicToken {
  constructor() {
    super();
    this.allowed = {};
  }

  transferFrom(_from, _to, _value, msg_sender) {
    if (!(_to !== "0x0000000000000000000000000000000000000000")) throw new Error("Invalid address");
    if (!(_value > 0n && _value <= (this.balances[_from] || 0n))) throw new Error("Invalid value or insufficient balance");
    if (!(this.allowed[_from] && _value <= (this.allowed[_from][msg_sender] || 0n))) throw new Error("Allowance exceeded");

    this.balances[_from] = SafeMath.sub(this.balances[_from], _value);
    this.balances[_to] = SafeMath.add((this.balances[_to] || 0n), _value);
    this.allowed[_from][msg_sender] = SafeMath.sub(this.allowed[_from][msg_sender], _value);
    console.log("Transfer", _from, _to, _value);
    return true;
  }

  approve(_spender, _value, msg_sender) {
    if (!this.allowed[msg_sender]) this.allowed[msg_sender] = {};
    this.allowed[msg_sender][_spender] = _value;
    console.log("Approval", msg_sender, _spender, _value);
    return true;
  }

  allowance(_owner, _spender) {
    return (this.allowed[_owner] && this.allowed[_owner][_spender]) || 0n;
  }
}

class Ownable {
  constructor() {
    this.owner = "";
  }

  transferOwnership(newOwner, msg_sender) {
    if (!(msg_sender === this.owner)) throw new Error("Not owner");
    if (!(newOwner !== "0x0000000000000000000000000000000000000000")) throw new Error("Invalid address");
    console.log("OwnershipTransferred", this.owner, newOwner);
    this.owner = newOwner;
  }
}

class Pausable extends Ownable {
  constructor() {
    super();
    this.paused = false;
  }

  pause(msg_sender) {
    if (!(msg_sender === this.owner)) throw new Error("Not owner");
    if (!(this.paused === false)) throw new Error("Already paused");
    this.paused = true;
    console.log("Pause");
  }

  unpause(msg_sender) {
    if (!(msg_sender === this.owner)) throw new Error("Not owner");
    if (!(this.paused === true)) throw new Error("Not paused");
    this.paused = false;
    console.log("Unpause");
  }
}

class PausableToken extends StandardToken {
  constructor() {
    super();
    this.paused = false;
  }

  transfer(_to, _value, msg_sender) {
    if (!(this.paused === false)) throw new Error("Paused");
    return super.transfer(_to, _value, msg_sender);
  }

  transferFrom(_from, _to, _value, msg_sender) {
    if (!(this.paused === false)) throw new Error("Paused");
    return super.transferFrom(_from, _to, _value, msg_sender);
  }

  approve(_spender, _value, msg_sender) {
    if (!(this.paused === false)) throw new Error("Paused");
    return super.approve(_spender, _value, msg_sender);
  }

  batchTransfer(_receivers, _value, msg_sender) {
    if (!(this.paused === false)) throw new Error("Paused");
    let cnt = BigInt(_receivers.length);
    //
    let amount = SafeMath.mul(cnt, _value);
    if (!(cnt > 0n && cnt <= 20n)) throw new Error("Invalid count");
    if (!(_value > 0n && (this.balances[msg_sender] || 0n) >= amount)) throw new Error("Invalid value or balance");

    this.balances[msg_sender] = SafeMath.sub(this.balances[msg_sender], amount);
    for (let i = 0n; i < cnt; i++) {
        let receiver = _receivers[Number(i)];
        this.balances[receiver] = SafeMath.add((this.balances[receiver] || 0n), _value);
        console.log("Transfer", msg_sender, receiver, _value);
    }
    return true;
  }
}

class BecToken extends PausableToken {
  constructor(msg_sender) {
    super();
    this.name = "BeautyChain";
    this.symbol = "BEC";
    this.version = '1.0.0';
    this.decimals = 18n;
    this.owner = msg_sender;
    this.totalSupply = 7000000000n * (10n ** this.decimals);
    this.balances[msg_sender] = this.totalSupply;
  }

  fallback() {
    throw new Error("Reverted");
  }
}