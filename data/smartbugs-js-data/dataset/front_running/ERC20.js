/*



 */

class SafeMath {

  /**
  * @dev Multiplies two numbers, reverts on overflow.
  */
  static mul(a, b) {
    // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
    // benefit is lost if 'b' is also tested.
    // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
    if (a === 0n) {
      return 0n;
    }

    let c = a * b;
    if (!(c / a === b)) throw new Error("require");

    return c;
  }

  /**
  * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
  */
  static div(a, b) {
    if (!(b > 0n)) throw new Error("require"); // Solidity only automatically asserts when dividing by 0
    let c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold

    return c;
  }

  /**
  * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
  */
  static sub(a, b) {
    if (!(b <= a)) throw new Error("require");
    let c = a - b;

    return c;
  }

  /**
  * @dev Adds two numbers, reverts on overflow.
  */
  static add(a, b) {
    let c = a + b;
    if (!(c >= a)) throw new Error("require");

    return c;
  }

  /**
  * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
  static mod(a, b) {
    if (!(b !== 0n)) throw new Error("require");
    return a % b;
  }
}


class ERC20 {

  // [SIMULATED: event Transfer( address indexed from, address indexed to, uint256 value )]
  // [SIMULATED: event Approval( address indexed owner, address indexed spender, uint256 value)]
  
  constructor(totalSupply, msg_sender) {
    this._balances = {};
    this._allowed = {};
    this._totalSupply = 0n;
    this._balances[msg_sender] = totalSupply;
  }

  balanceOf(owner) {
    return this._balances[owner] || 0n;
  }


  allowance(owner, spender)
  {
    return (this._allowed[owner] && this._allowed[owner][spender]) || 0n;
  }

  transfer(to, value, msg_sender) {
    if (!(value <= (this._balances[msg_sender] || 0n))) throw new Error("require");
    if (!(to !== "0x0000000000000000000000000000000000000000")) throw new Error("require");

    this._balances[msg_sender] = SafeMath.sub((this._balances[msg_sender] || 0n), value);
    this._balances[to] = SafeMath.add((this._balances[to] || 0n), value);
    console.log("Transfer", msg_sender, to, value);
    return true;
  }
  //
  approve(spender, value, msg_sender) {
    if (!(spender !== "0x0000000000000000000000000000000000000000")) throw new Error("require");
     //
    if (!this._allowed[msg_sender]) this._allowed[msg_sender] = {};
    this._allowed[msg_sender][spender] = value;
    console.log("Approval", msg_sender, spender, value);
    return true;
  }

  transferFrom(from, to, value, msg_sender) {
    require(value <= (this._balances[from] || 0n));
    require(value <= ((this._allowed[from] && this._allowed[from][msg_sender]) || 0n));
    require(to !== "0x0000000000000000000000000000000000000000");

    this._balances[from] = SafeMath.sub((this._balances[from] || 0n), value);
    this._balances[to] = SafeMath.add((this._balances[to] || 0n), value);
    this._allowed[from][msg_sender] = SafeMath.sub((this._allowed[from][msg_sender] || 0n), value);
    console.log("Transfer", from, to, value);
    return true;
  }
}