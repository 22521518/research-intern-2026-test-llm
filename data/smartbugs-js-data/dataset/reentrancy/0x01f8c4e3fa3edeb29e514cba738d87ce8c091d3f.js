/*



 */

class PERSONAL_BANK {
    constructor() {
        this.balances = {};
        this.MinSum = 1000000000000000000n;
        this.Log = new LogFile("0x0486cF65A2F2F3A392CBEa398AFB7F5f0B72FF46"); // [SIMULATED: LogFile contract]
        this.intitalized = false;
    }

    SetMinSum(_val) {
        if (this.intitalized) throw new Error();
        this.MinSum = _val;
    }

    SetLogFile(_log) {
        if (this.intitalized) throw new Error();
        this.Log = new LogFile(_log); // [SIMULATED: LogFile contract]
    }

    Initialized() {
        this.intitalized = true;
    }

    Deposit(msg_sender, msg_value) {
        this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
        this.Log.AddMessage(msg_sender, msg_value, "Put");
    }

    Collect(_am, msg_sender) {
        if ((this.balances[msg_sender] || 0n) >= this.MinSum && (this.balances[msg_sender] || 0n) >= _am) {
            //
            if (/* [SIMULATED: msg.sender.call.value(_am)()] */ true) {
                this.balances[msg_sender] = (this.balances[msg_sender] || 0n) - _am;
                this.Log.AddMessage(msg_sender, _am, "Collect");
            }
        }
    }

    fallback(msg_sender, msg_value) {
        this.Deposit(msg_sender, msg_value);
    }
}

class LogFile {
    constructor(address) {
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