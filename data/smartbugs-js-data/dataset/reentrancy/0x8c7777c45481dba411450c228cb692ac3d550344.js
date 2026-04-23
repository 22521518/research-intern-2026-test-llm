/*



 */

class ETH_VAULT {
    constructor(_log) {
        this.balances = {}; // [SIMULATED: mapping]
        this.TransferLog = Log(_log);
        this.MinDeposit = 1000000000000000000n;
    }

    Deposit(msg_sender, msg_value) {
        if (msg_value > this.MinDeposit) {
            this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
            this.TransferLog.AddMessage(msg_sender, msg_value, "Deposit");
        }
    }

    CashOut(_am, msg_sender) {
        if (_am <= (this.balances[msg_sender] || 0n)) {
            //
            if (msg_sender.call.value(_am)()) {
                this.balances[msg_sender] -= _am;
                this.TransferLog.AddMessage(msg_sender, _am, "CashOut");
            }
        }
    }

    fallback() {} // [SIMULATED: function() public payable{}]
}

class Log {
    constructor() {
        this.History = []; // [SIMULATED: array]
        this.HistoryLength = 0n; // [SIMULATED: array length tracking]
        this.LastMsg = {}; // [SIMULATED: struct]
    }

    AddMessage(_adr, _val, _data) {
        this.LastMsg.Sender = _adr;
        this.LastMsg.Time = BigInt(Math.floor(Date.now() / 1000)); // [SIMULATED: now]
        this.LastMsg.Val = _val;
        this.LastMsg.Data = _data;
        this.History[Number(this.HistoryLength)] = this.LastMsg;
        this.HistoryLength += 1n;
    }
}