/*



 */

class ETH_FUND {
    constructor(_log) {
        this.balances = {}; // [SIMULATED: mapping]
        this.MinDeposit = 1000000000000000000n;
        this.TransferLog = new Log(_log);
        this.lastBlock = 0n;
    }

    Deposit(msg_sender, msg_value, block_number) {
        if (msg_value > this.MinDeposit) {
            this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
            this.TransferLog.AddMessage(msg_sender, msg_value, "Deposit");
            this.lastBlock = block_number;
        }
    }

    CashOut(_am, msg_sender, block_number) {
        if (_am <= (this.balances[msg_sender] || 0n) && block_number > this.lastBlock) {
            //
            if (true) { // [SIMULATED: msg.sender.call.value(_am)()]
                this.balances[msg_sender] = (this.balances[msg_sender] || 0n) - _am;
                if (this.balances[msg_sender] < 0n) this.balances[msg_sender] = (2n ** 256n) + this.balances[msg_sender];
                this.TransferLog.AddMessage(msg_sender, _am, "CashOut");
            }
        }
    }

    fallback() {} // [SIMULATED: function() public payable{}]
}

class Log {
    constructor() {
        this.History = [];
        this.HistoryLength = 0n; // [SIMULATED: array length tracking]
        this.LastMsg = {};
    }

    AddMessage(_adr, _val, _data, now) {
        this.LastMsg.Sender = _adr;
        this.LastMsg.Time = now;
        this.LastMsg.Val = _val;
        this.LastMsg.Data = _data;
        this.History[Number(this.HistoryLength)] = this.LastMsg;
        this.HistoryLength += 1n;
    }
}