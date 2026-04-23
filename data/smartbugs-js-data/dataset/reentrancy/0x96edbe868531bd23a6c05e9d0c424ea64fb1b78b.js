/*



 */

class PENNY_BY_PENNY {
    constructor() {
        this.Acc = {}; // [SIMULATED: mapping]
        this.MinSum = 0n;
        this.Log = null; // [SIMULATED: LogFile]
        this.intitalized = false;
    }

    SetMinSum(_val) {
        if (this.intitalized) throw new Error();
        this.MinSum = _val;
    }

    SetLogFile(_log) {
        if (this.intitalized) throw new Error();
        this.Log = _log; // [SIMULATED: LogFile(_log)]
    }

    Initialized() {
        this.intitalized = true;
    }

    Put(_lockTime, msg_sender, msg_value, now) {
        let acc = this.Acc[msg_sender];
        if (acc === undefined) { acc = { unlockTime: 0n, balance: 0n }; this.Acc[msg_sender] = acc; }
        acc.balance += msg_value;
        if (now + _lockTime > acc.unlockTime) acc.unlockTime = now + _lockTime;
        this.Log.AddMessage(msg_sender, msg_value, "Put");
    }

    Collect(_am, msg_sender, msg_value, now) {
        let acc = this.Acc[msg_sender];
        if (acc.balance >= this.MinSum && acc.balance >= _am && now > acc.unlockTime) {
            //
            if (msg_sender.call.value(_am)()) {
                acc.balance -= _am;
                this.Log.AddMessage(msg_sender, _am, "Collect");
            }
        }
    }

    fallback(msg_sender, msg_value, now) {
        this.Put(0n, msg_sender, msg_value, now);
    }
}

class LogFile {
    constructor() {
        this.History = [];
        this.HistoryLength = 0n; // [SIMULATED: array length]
        this.LastMsg = { Sender: "", Data: "", Val: 0n, Time: 0n };
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