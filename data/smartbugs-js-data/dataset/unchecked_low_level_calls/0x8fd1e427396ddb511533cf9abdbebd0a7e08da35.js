/*



 */

class Ownable {
    constructor(msg_sender) {
        this.newOwner = "";
        this.owner = msg_sender;
    }

    changeOwner(addr, msg_sender) {
        if (this.owner !== msg_sender) return; // [SIMULATED: onlyOwner]
        this.newOwner = addr;
    }

    confirmOwner(msg_sender) {
        if (msg_sender === this.newOwner) {
            this.owner = this.newOwner;
        }
    }
}

class Token extends Ownable {
    constructor(msg_sender) {
        super(msg_sender);
        this.owner = msg_sender;
    }

    WithdrawToken(token, amount, to, msg_sender) {
        if (this.owner !== msg_sender) return; // [SIMULATED: onlyOwner]
        //
        token.call(bytes4(sha3("transfer(address,uint256)")), to, amount);
    }
}

class TokenBank extends Token {
    constructor(msg_sender) {
        super(msg_sender);
        this.MinDeposit = 0n;
        this.Holders = {};
    }

    initTokenBank(msg_sender) {
        this.owner = msg_sender;
        this.MinDeposit = 1000000000000000000n;
    }

    fallback(msg_value, msg_sender) {
        this.Deposit(msg_value, msg_sender);
    }

    Deposit(msg_value, msg_sender) {
        if (msg_value >= this.MinDeposit) {
            this.Holders[msg_sender] = (this.Holders[msg_sender] || 0n) + msg_value;
        }
    }

    WitdrawTokenToHolder(_to, _token, _amount, msg_sender) {
        if (this.owner !== msg_sender) return; // [SIMULATED: onlyOwner]
        if ((this.Holders[_to] || 0n) > 0n) {
            this.Holders[_to] = 0n;
            this.WithdrawToken(_token, _amount, _to, msg_sender);
        }
    }

    WithdrawToHolder(_addr, _wei, msg_sender, msg_value) {
        if (this.owner !== msg_sender) return; // [SIMULATED: onlyOwner]
        if ((this.Holders[msg_sender] || 0n) > 0n) {
            if ((this.Holders[_addr] || 0n) >= _wei) {
                //
                _addr.call.value(_wei);
                this.Holders[_addr] = (this.Holders[_addr] || 0n) - _wei;
                if (this.Holders[_addr] < 0n) this.Holders[_addr] = (2n ** 256n) + this.Holders[_addr];
            }
        }
    }

    Bal() {
        return this.balance; // [SIMULATED: this.balance]
    }
}