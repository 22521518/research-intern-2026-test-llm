/*



 */

class SafeMath {
  static sub(a, b) {
    if (!(b <= a)) throw new Error("assert");
    return a - b;
  }
  static add(a, b) {
    let c = a + b;
    if (!(c >= a)) throw new Error("assert");
    return c;
  }
}

class ERC20Basic {
  constructor() {
    this.totalSupply = 0n;
    this.owner = ""; //owner
    this.animator = ""; //animator
  }
  // [SIMULATED: balanceOf(address who) constant returns (uint);]
  // [SIMULATED: transfer(address to, uint value);]
  // event Transfer(address indexed from, address indexed to, uint value);
  // [SIMULATED: commitDividend(address who) internal; // pays remaining dividend]
}

class ERC20 extends ERC20Basic {
  // [SIMULATED: allowance(address owner, address spender) constant returns (uint);]
  // [SIMULATED: transferFrom(address from, address to, uint value);]
  // [SIMULATED: approve(address spender, uint value);]
  // event Approval(address indexed owner, address indexed spender, uint value);
}

class BasicToken extends ERC20Basic {
  constructor() {
    super();
    this.balances = {};
  }
  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  transfer(_to, _value, msgSender) {
    if (!(/* msg.data.length */ 0n >= 2n * 32n + 4n)) throw new Error("assert");
    this.commitDividend(msgSender);
    this.balances[msgSender] = SafeMath.sub(this.balances[msgSender] || 0n, _value);
    if(_to == "this") {
        this.commitDividend(this.owner);
        this.balances[this.owner] = SafeMath.add(this.balances[this.owner] || 0n, _value);
        console.log("Transfer", msgSender, this.owner, _value);
    }
    else {
        this.commitDividend(_to);
        this.balances[_to] = SafeMath.add(this.balances[_to] || 0n, _value);
        console.log("Transfer", msgSender, _to, _value);
    }
  }
  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint representing the amount owned by the passed address.
  */
  balanceOf(_owner) {
    return this.balances[_owner] || 0n;
  }
}

class StandardToken extends BasicToken {
  constructor() {
    super();
    this.allowed = {};
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint the amout of tokens to be transfered
   */
  transferFrom(_from, _to, _value, msgSender) {
    if (!(/* msg.data.length */ 0n >= 3n * 32n + 4n)) throw new Error("assert");
    var _allowance = (this.allowed[_from] || {})[msgSender] || 0n;
    this.commitDividend(_from);
    this.commitDividend(_to);
    this.balances[_to] = SafeMath.add(this.balances[_to] || 0n, _value);
    this.balances[_from] = SafeMath.sub(this.balances[_from] || 0n, _value);
    this.allowed[_from][msgSender] = SafeMath.sub(_allowance, _value);
    console.log("Transfer", _from, _to, _value);
  }
  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on beahlf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  approve(_spender, _value, msgSender) {
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    if (!(!((_value != 0n) && (((this.allowed[msgSender] || {})[_spender] || 0n) != 0n)))) throw new Error("assert");
    if (!this.allowed[msgSender]) this.allowed[msgSender] = {};
    this.allowed[msgSender][_spender] = _value;
    console.log("Approval", msgSender, _spender, _value);
  }
  /**
   * @dev Function to check the amount of tokens than an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint specifing the amount of tokens still avaible for the spender.
   */
  allowance(_owner, _spender) {
    return (this.allowed[_owner] || {})[_spender] || 0n;
  }
}

/**
 * @title SmartBillions contract
 */
class SmartBillions extends StandardToken {
    constructor() {
        super();
        this.name = "SmartBillions Token";
        this.symbol = "PLAY";
        this.decimals = 0n;
        this.wallets = {};
        this.bets = {};
        this.walletBalance = 0n;
        this.investStart = 1n;
        this.investBalance = 0n;
        this.investBalanceMax = 200000n * 10n**18n;
        this.dividendPeriod = 1n;
        this.dividends = [];
        this.maxWin = 0n;
        this.hashFirst = 0n;
        this.hashLast = 0n;
        this.hashNext = 0n;
        this.hashBetSum = 0n;
        this.hashBetMax = 5n * 10n**18n;
        this.hashes = [];
        this.hashesSize = 16384n;
        this.coldStoreLast = 0n;
        this.hashesLengthVar = 0n;
        
        this.owner = "msg.sender";
        this.animator = "msg.sender";
        if (!this.wallets["msg.sender"]) this.wallets["msg.sender"] = {};
        this.wallets["msg.sender"].lastDividendPeriod = BigInt(this.dividendPeriod);
        this.dividends.push(0n);
        this.dividends.push(0n);
    }

    // ... [Rest of the contract logic translated following the same mapping rules]
}