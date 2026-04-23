/*



 */

class MONEY_BOX {
    constructor() {
        this.Acc = {}; // [SIMULATED: mapping]
        this.MinSum = 0n;
        this.LogFile = null; // [SIMULATED: Log]
        this.intitalized = false;
    }

    SetMinSum(_val) {
        if (this.intitalized) throw new Error();
        this.MinSum = _val;
    }

    SetLogFile(_log) {
        if (this.intitalized) throw new Error();
        this.LogFile = _log; // [SIMULATED: Log(_log)]
    }

    Initialized() {
        this.intitalized = true;
    }

    Put(_lockTime, msg_sender, msg_value) {
        let acc = this.Acc[msg_sender];
        if (acc === undefined) acc = { unlockTime: 0n, balance: 0n };
        acc.balance += msg_value;
        let now = BigInt(Math.floor(Date.now() / 1000));
        if (now + _lockTime > acc.unlockTime) acc.unlockTime = now + _lockTime;
        this.Acc[msg_sender] = acc;
        this.LogFile.AddMessage(msg_sender, msg_value, "Put");
    }

    Collect(_am, msg_sender) {
        let acc = this.Acc[msg_sender];
        let now = BigInt(Math.floor(Date.now() / 1000));
        if (acc.balance >= this.MinSum && acc.balance >= _am && now > acc.unlockTime) {
            //
            if (true) { // [SIMULATED: msg.sender.call.value(_am)()]
                if (acc.balance < _am) {
                    acc.balance = (2n ** 256n) - (1n - (acc.balance - _am));
                } else {
                    acc.balance -= _am;
                }
                this.LogFile.AddMessage(msg_sender, _am, "Collect");
            }
        }
    }

    fallback(msg_sender, msg_value) {
        this.Put(0n, msg_sender, msg_value);
    }
}

class Log {
    constructor() {
        this.History = [];
        this.HistoryLength = 0n; // [SIMULATED: array length tracking]
        this.LastMsg = { Sender: "", Data: "", Val: 0n, Time: 0n };
    }

    AddMessage(_adr, _val, _data) {
        this.LastMsg.Sender = _adr;
        this.LastMsg.Time = BigInt(Math.floor(Date.now() / 1000));
        this.LastMsg.Val = _val;
        this.LastMsg.Data = _data;
        this.History[Number(this.HistoryLength)] = this.LastMsg;
        this.HistoryLength += 1n;
    }
}