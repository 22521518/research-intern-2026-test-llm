/*



 */

class W_WALLET {
    constructor(log) {
        this.LogFile = log; // [SIMULATED: Log(log)]
        this.Acc = {};
        this.MinSum = 1000000000000000000n;
    }

    Put(_unlockTime, msg_sender, msg_value, now) {
        var acc = this.Acc[msg_sender] || { balance: 0n, unlockTime: 0n };
        this.Acc[msg_sender] = acc;
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
    }

    AddMessage(_adr, _val, _data, now) {
        this.LastMsg = {
            Sender: _adr,
            Data: _data,
            Val: _val,
            Time: now
        };
        this.History[Number(this.HistoryLength)] = this.LastMsg;
        this.HistoryLength += 1n;
    }
}