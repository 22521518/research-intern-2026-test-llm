/*



 */

class PrivateDeposit {
    constructor() {
        this.balances = {};
        this.MinDeposit = 1000000000000000000n;
        this.owner = "";
        this.TransferLog = null;
    }

    // [SIMULATED: modifier onlyOwner]
    
    function_PrivateDeposit(msg_sender) {
        this.owner = msg_sender;
        this.TransferLog = new Log();
    }
    
    function_setLog(address_lib, tx_origin) {
        if (!(tx_origin === this.owner)) throw new Error("");
        this.TransferLog = address_lib;
    }    
    
    function_Deposit(msg_sender, msg_value) {
        if(msg_value >= this.MinDeposit)
        {
            this.balances[msg_sender] = (this.balances[msg_sender] || 0n) + msg_value;
            this.TransferLog.AddMessage(msg_sender, msg_value, "Deposit");
        }
    }
    
    function_CashOut(uint_am, msg_sender) {
        if(uint_am <= (this.balances[msg_sender] || 0n))
        {            
            //
            if(msg_sender.call.value(uint_am)())
            {
                this.balances[msg_sender] -= uint_am;
                this.TransferLog.AddMessage(msg_sender, uint_am, "CashOut");
            }
        }
    }
    
    function_fallback() {}    
    
}

class Log {
    constructor() {
        this.History = [];
        this.LastMsg = {};
        this.History_length = 0n; // [SIMULATED: array length]
    }
    
    function_AddMessage(address_adr, uint_val, string_data, now) {
        this.LastMsg.Sender = address_adr;
        this.LastMsg.Time = now;
        this.LastMsg.Val = uint_val;
        this.LastMsg.Data = string_data;
        this.History[Number(this.History_length)] = this.LastMsg;
        this.History_length += 1n;
    }
}