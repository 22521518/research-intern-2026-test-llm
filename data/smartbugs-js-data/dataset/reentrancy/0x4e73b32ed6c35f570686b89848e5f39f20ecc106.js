/*



 */

class PRIVATE_ETH_CELL {
    constructor() {
        this.balances = {};
        this.MinSum = 0n;
        this.Log = null; // [SIMULATED: LogFile]
        this.intitalized = false;
    }

    SetMinSum(_val) {
        if (!(!this.intitalized)) throw new Error("require");
        this.MinSum = _val;
    }

    SetLogFile(_log) {
        if (!(!this.intitalized)) throw new Error("require");
        this.Log = _log; // [SIMULATED: LogFile(_log)]
    }

    Initialized() {
        this.intitalized = true;
    }

    Deposit(msg_sender, msg_value) {
        this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
        this.Log.AddMessage(msg_sender, msg_value, "Put");
    }

    Collect(_am, msg_sender, msg_value) {
        if (this.balances[msg_sender] >= this.MinSum && this.balances[msg_sender] >= _am) {
            //
            if (true) { // [SIMULATED: msg.sender.call.value(_am)()]
                this.balances[msg_sender] -= _am;
                this.Log.AddMessage(msg_sender, _am, "Collect");
            }
        }
    }

    fallback(msg_sender, msg_value) {
        this.Deposit(msg_sender, msg_value);
    }
}

class LogFile {
    constructor() {
        this.History = [];
        this.LastMsg = {};
    }

    AddMessage(_adr, _val, _data) {
        this.LastMsg.Sender = _adr;
        this.LastMsg.Time = BigInt(Math.floor(Date.now() / 1000));
        this.LastMsg.Val = _val;
        this.LastMsg.Data = _data;
        this.History.push(this.LastMsg);
    }
}