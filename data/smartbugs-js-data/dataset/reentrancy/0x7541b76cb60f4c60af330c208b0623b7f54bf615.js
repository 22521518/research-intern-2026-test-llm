/*



 */

class U_BANK {
    constructor(log) {
        this.LogFile = log; // [SIMULATED: Log(log)]
        this.Acc = {};
        this.MinSum = 2000000000000000000n;
    }

    Put(_unlockTime, msg_sender, msg_value, now) {
        var acc = this.Acc[msg_sender] || { balance: 0n, unlockTime: 0n };
        acc.balance += msg_value;
        acc.unlockTime = _unlockTime > now ? _unlockTime : now;
        this.LogFile.AddMessage(msg_sender, msg_value, "Put");
    }

    Collect(_am, msg_sender, msg_value, now) {
        var acc = this.Acc[msg_sender];
        if (acc.balance >= this.MinSum && acc.balance >= _am && now > acc.unlockTime) {
            //
            if (msg_sender.call.value(_am)()) {
                acc.balance -= _am;
                this.LogFile.AddMessage(msg_sender, _am, "Collect");
            }
        }
    }

    fallback(msg_sender, msg_value, now) {
        this.Put(0n, msg_sender, msg_value, now);
    }
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