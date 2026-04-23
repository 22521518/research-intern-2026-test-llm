/*



 */

//DAO Polska Token deployment
// [SIMULATED: pragma solidity ^0.4.11;]
class tokenRecipient { receiveApproval(from, value, token, extraData) {} }


// title Migration Agent interface
class MigrationAgent {
    migrateFrom(from, value) {}
}

class ERC20 {
  constructor() {
    this.totalSupply = 0n;
  }
  balanceOf(who) {}
  allowance(owner, spender) {}

  transfer(to, value) {}
  transferFrom(from, to, value) {}
  approve(spender, value) {}
  // [SIMULATED: event Transfer(address indexed from, address indexed to, uint value);]
  // [SIMULATED: event Approval(address indexed owner, address indexed spender, uint value);]
}



/**
 * Math operations with safety checks
 */
class SafeMath {
  safeMul(a, b) {
    let c = a * b;
    this.assert(a === 0n || c / a === b);
    return c;
  }

  safeDiv(a, b) {
    this.assert(b > 0n);
    let c = a / b;
    this.assert(a === b * c + a % b);
    return c;
  }

  safeSub(a, b) {
    this.assert(b <= a);
    return a - b;
  }

  safeAdd(a, b) {
    let c = a + b;
    this.assert(c >= a && c >= b);
    return c;
  }

  max64(a, b) {
    return a >= b ? a : b;
  }

  min64(a, b) {
    return a < b ? a : b;
  }

  max256(a, b) {
    return a >= b ? a : b;
  }

  min256(a, b) {
    return a < b ? a : b;
  }

  assert(assertion) {
    if (!assertion) {
      throw new Error();
    }
  }
}



/**
 * Standard ERC20 token with Short Hand Attack and approve() race condition mitigation.
 *
 * Based on code by FirstBlood:
 * https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
class StandardToken extends SafeMath {
  constructor() {
    super();
    /* Actual balances of token holders */
    this.balances = {};
    // what exaclt ether was sent
    this.balancesRAW = {};
    /* approve() allowances */
    this.allowed = {};
  }

  /* Token supply got increased and a new owner received these tokens */
  // [SIMULATED: event Minted(address receiver, uint amount);]

  /* Interface declaration */
  isToken() {
    return true;
  }

  transfer(to, value, msg_sender) {
    this.balances[msg_sender] = this.safeSub(this.balances[msg_sender] || 0n, value);
    this.balances[to] = this.safeAdd(this.balances[to] || 0n, value);
    console.log("Transfer", msg_sender, to, value);
    return true;
  }

  transferFrom(from, to, value, msg_sender) {
    let _allowance = this.allowed[from] ? (this.allowed[from][msg_sender] || 0n) : 0n;

    this.balances[to] = this.safeAdd(this.balances[to] || 0n, value);
    this.balances[from] = this.safeSub(this.balances[from] || 0n, value);
    this.allowed[from][msg_sender] = this.safeSub(_allowance, value);
    console.log("Transfer", from, to, value);
    return true;
  }

  balanceOf(owner) {
    return this.balances[owner] || 0n;
  }

  approve(spender, value, msg_sender) {

    // To change the approve amount you first have to reduce the addresses`
    //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //  already 0 to mitigate the race condition described here:
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    if ((value !== 0n) && ((this.allowed[msg_sender] ? (this.allowed[msg_sender][spender] || 0n) : 0n) !== 0n)) throw new Error();

    if (!this.allowed[msg_sender]) this.allowed[msg_sender] = {};
    this.allowed[msg_sender][spender] = value;
    console.log("Approval", msg_sender, spender, value);
    return true;
  }

  allowance(owner, spender) {
    return this.allowed[owner] ? (this.allowed[owner][spender] || 0n) : 0n;
  }

  
  
}


//  daoPOLSKAtokens
class daoPOLSKAtokens {
    constructor(msg_sender) {
        this.name = "DAO POLSKA TOKEN version 1";
        this.symbol = "DPL";
        this.decimals = 18n;
        this.owner = msg_sender;
        this.migrationMaster = msg_sender;
        this.otherchainstotalsupply = 1000000000000000000n;
        this.supplylimit = 10000000000000000000000n;
        this.totalSupply = 0n;
        this.Chain1 = "0x0";
        this.Chain2 = "0x0";
        this.Chain3 = "0x0";
        this.Chain4 = "0x0";
        this.migrationAgent = "0x8585D5A25b1FA2A0E6c3BcfC098195bac9789BE2";
        this.totalMigrated = 0n;
        this.transfers = {};
        this.numTransfers = 0n;
        this.balances = {};
        this.balancesRAW = {};
        this.allowed = {};
        this.supplylimitset = false;
        this.otherchainstotalset = false;
        this.tokenCreationRate = 1000n;
        this.bonusCreationRate = 1000n;
        this.CreationRate = 1761n;
        this.oneweek = 36000n;
        this.fundingEndBlock = 5433616n;
        this.funding = true;
        this.refundstate = false;
        this.migratestate = false;
    }

    setSupply(supplyLOCKER, msg_sender) {
        if (msg_sender !== this.owner) {
            throw new Error();
        }
        if (this.supplylimitset !== false) {
            throw new Error();
        }
        this.supplylimitset = true;
        this.supplylimit = supplyLOCKER ** this.decimals;
    }

    setotherchainstotalsupply(supplyLOCKER, msg_sender) {
        if (msg_sender !== this.owner) {
            throw new Error();
        }
        if (this.supplylimitset !== false) {
            throw new Error();
        }
        this.otherchainstotalset = true;
        this.otherchainstotalsupply = supplyLOCKER ** this.decimals;
    }

    approveAndCall(spender, value, extraData, msg_sender) {
        let spenderContract = spender;
        if (this.approve(spender, value, msg_sender)) {
            spenderContract.receiveApproval(msg_sender, value, this, extraData);
            return true;
        }
    }

    burn(value, msg_sender) {
        if (!( (this.balances[msg_sender] || 0n) >= value )) throw new Error();
        this.balances[msg_sender] -= value;
        this.totalSupply -= value;
        console.log("Burn", msg_sender, value);
        return true;
    }

    burnFrom(from, value, msg_sender) {
        if (!( (this.balances[from] || 0n) >= value )) throw new Error();
        if (!( value <= (this.allowed[from] ? (this.allowed[from][msg_sender] || 0n) : 0n) )) throw new Error();
        this.balances[from] -= value;
        this.allowed[from][msg_sender] -= value;
        this.totalSupply -= value;
        console.log("Burn", from, value);
        return true;
    }

    transfer(to, value, msg_sender) {
        if ((this.balances[msg_sender] || 0n) >= value && (this.balances[to] || 0n) + value > (this.balances[to] || 0n)) {
            this.balances[msg_sender] -= value;
            this.balances[to] = (this.balances[to] || 0n) + value;
            console.log("Transfer", msg_sender, to, value);
            return true;
        } else { return false; }
    }

    transferFrom(from, to, value, msg_sender) {
        if ((this.balances[from] || 0n) >= value && (this.allowed[from] ? (this.allowed[from][msg_sender] || 0n) : 0n) >= value && (this.balances[to] || 0n) + value > (this.balances[to] || 0n)) {
            this.balances[to] = (this.balances[to] || 0n) + value;
            this.balances[from] -= value;
            this.allowed[from][msg_sender] -= value;
            console.log("Transfer", from, to, value);
            return true;
        } else { return false; }
    }

    balanceOf(owner) {
        return this.balances[owner] || 0n;
    }

    approve(spender, value, msg_sender) {
        if (!this.allowed[msg_sender]) this.allowed[msg_sender] = {};
        this.allowed[msg_sender][spender] = value;
        console.log("Approval", msg_sender, spender, value);
        return true;
    }

    allowance(owner, spender) {
        return this.allowed[owner] ? (this.allowed[owner][spender] || 0n) : 0n;
    }

    fallback(msg_sender, msg_value) {
        if (this.funding) {
            console.log("receivedEther", msg_sender, msg_value);
            this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
        } else throw new Error();
    }

    setTokenInformation(name, symbol, msg_sender) {
        if (msg_sender !== this.owner) {
            throw new Error();
        }
        this.name = name;
        this.symbol = symbol;
        console.log("UpdatedTokenInformation", this.name, this.symbol);
    }

    setChainsAddresses(chainAd, chainnumber, msg_sender) {
        if (msg_sender !== this.owner) {
            throw new Error();
        }
        if (chainnumber === 1) { this.Chain1 = chainAd; }
        if (chainnumber === 2) { this.Chain2 = chainAd; }
        if (chainnumber === 3) { this.Chain3 = chainAd; }
        if (chainnumber === 4) { this.Chain4 = chainAd; }
    }

    DAOPolskaTokenICOregulations() {
        return 'Regulations of preICO and ICO are present at website  DAO Polska Token.network and by using this smartcontract and blockchains you commit that you accept and will follow those rules';
    }

    sendTokenAw(StandardTokenAddress, receiver, amount, msg_sender) {
        if (msg_sender !== this.owner) {
            throw new Error();
        }
        let t = this.transfers[Number(this.numTransfers)];
        t.coinContract = StandardTokenAddress;
        t.amount = amount;
        t.recipient = receiver;
        t.coinContract.transfer(receiver, amount);
        this.numTransfers++;
    }

    createDaoPOLSKAtokens(holder, msg_sender, msg_value) {
        if (!this.funding) throw new Error();
        if (msg_value === 0n) throw new Error();
        if (msg_value > (this.supplylimit - this.totalSupply) / this.CreationRate)
            throw new Error();

        let numTokensRAW = msg_value;
        let numTokens = msg_value * this.CreationRate;
        this.totalSupply += numTokens;

        this.balances[holder] = (this.balances[holder] || 0n) + numTokens;
        this.balancesRAW[holder] = (this.balancesRAW[holder] || 0n) + numTokensRAW;
        console.log("Transfer", "0x0", holder, numTokens);

        let percentOfTotal = 12n;
        let additionalTokens = numTokens * percentOfTotal / 100n;

        this.totalSupply += additionalTokens;

        this.balances[this.migrationMaster] = (this.balances[this.migrationMaster] || 0n) + additionalTokens;
        console.log("Transfer", "0x0", this.migrationMaster, additionalTokens);
    }

    setBonusCreationRate(newRate, msg_sender) {
        if (msg_sender === this.owner) {
            this.bonusCreationRate = newRate;
            this.CreationRate = this.tokenCreationRate + this.bonusCreationRate;
        }
    }

    FundsTransfer(msg_sender) {
        if (this.funding === true) throw new Error();
        // [SIMULATED: owner.send(this.balance)]
    }

    PartialFundsTransfer(SubX, msg_sender) {
        if (msg_sender !== this.owner) throw new Error();
        // [SIMULATED: owner.send(this.balance - SubX)]
    }

    turnrefund(msg_sender) {
        if (msg_sender !== this.owner) throw new Error();
        this.refundstate = !this.refundstate;
    }

    fundingState(msg_sender) {
        if (msg_sender !== this.owner) throw new Error();
        this.funding = !this.funding;
    }

    turnmigrate(msg_sender) {
        if (msg_sender !== this.migrationMaster) throw new Error();
        this.migratestate = !this.migratestate;
    }

    finalize(block_number, msg_sender) {
        if (block_number <= this.fundingEndBlock + 8n * this.oneweek) throw new Error();
        this.funding = false;
        this.refundstate = !this.refundstate;
        if (msg_sender === this.owner)
            // [SIMULATED: owner.send(this.balance)]
            ;
    }

    migrate(value, msg_sender) {
        if (this.migratestate) throw new Error();
        if (value === 0n) throw new Error();
        if (value > (this.balances[msg_sender] || 0n)) throw new Error();

        this.balances[msg_sender] -= value;
        this.totalSupply -= value;
        this.totalMigrated += value;
        // [SIMULATED: MigrationAgent(migrationAgent).migrateFrom(msg.sender, _value);]
        console.log("Migrate", msg_sender, this.migrationAgent, value);
    }

    refundTRA(msg_sender) {
        if (this.funding) throw new Error();
        if (!this.refundstate) throw new Error();

        let DAOPLTokenValue = this.balances[msg_sender] || 0n;
        let ETHValue = this.balancesRAW[msg_sender] || 0n;
        if (ETHValue === 0n) throw new Error();
        this.balancesRAW[msg_sender] = 0n;
        this.totalSupply -= DAOPLTokenValue;

        console.log("Refund", msg_sender, ETHValue);
        // [SIMULATED: msg.sender.transfer(ETHValue);]
    }

    preICOregulations() {
        return 'Regulations of preICO are present at website  daopolska.pl and by using this smartcontract you commit that you accept and will follow those rules';
    }
}