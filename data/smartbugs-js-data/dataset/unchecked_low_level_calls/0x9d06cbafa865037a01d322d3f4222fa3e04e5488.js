/*



 */

// [SIMULATED: pragma solidity ^0.4.23;]

// ----------------------------------------------------------------------------------------------
// Project Delta 
// DELTA - New Crypto-Platform with own cryptocurrency, verified smart contracts and multi blockchains!
// For 1 DELTA token in future you will get 1 DELTA coin!
// Site: http://delta.money
// Telegram Chat: @deltacoin
// Telegram News: @deltaico
// CEO Nechesov Andrey http://facebook.com/Nechesov     
// Telegram: @Nechesov
// Ltd. "Delta"
// Working with ERC20 contract https://etherscan.io/address/0xf85a2e95fa30d005f629cbe6c6d2887d979fff2a                  
// ----------------------------------------------------------------------------------------------
   
class Delta {     

	constructor() {
		this.c = "0xF85A2E95FA30d005F629cBe6c6d2887D979ffF2A"; 
		this.owner = "0x788c45dd60ae4dbe5055b5ac02384d5dc84677b0";	
		this.owner2 = "0x0C6561edad2017c01579Fd346a58197ea01A0Cf3";	
		this.active = 1n;	

		this.token_price = 10n**18n*1n/1000n; 
	}

	//default function for buy tokens      
	function_fallback(msg_sender, msg_value) {        
	    this.tokens_buy(msg_sender, msg_value);        
	}

	/**
	* Buy tokens
	*/
    tokens_buy(msg_sender, msg_value) {         
        
        if (!(this.active > 0n)) throw new Error("require(active > 0)");
        if (!(msg_value >= this.token_price)) throw new Error("require(msg.value >= token_price)");        

        let tokens_buy = msg_value*10n**18n/this.token_price;

        if (!(tokens_buy > 0n)) throw new Error("require(tokens_buy > 0)");

        if(!this.c.call(bytes4(sha3("transferFrom(address,address,uint256)")),this.owner, msg_sender,tokens_buy)){ // [SIMULATED: .call]
        	return false;
        }

        let sum2 = msg_value * 3n / 10n;           
        //
        this.owner2.send(sum2); // [SIMULATED: .send]

        return true;
      }     

      //Withdraw money from contract balance to owner
      withdraw(_amount, msg_sender) {
          if (msg_sender != this.owner) { throw new Error(); }
          let balance;
          balance = this.balance; // [SIMULATED: this.balance]
          if(_amount > 0n) balance = _amount;
          //
          this.owner.send(balance); // [SIMULATED: .send]
          return true;
      }

      //Change token
      change_token_price(_token_price, msg_sender) {
        if (msg_sender != this.owner) { throw new Error(); }
        this.token_price = _token_price;
        return true;
      }

      //Change active
      change_active(_active, msg_sender) {
        if (msg_sender != this.owner) { throw new Error(); }
        this.active = _active;
        return true;
      }

      // Functions with this modifier can only be executed by the owner
    	// [SIMULATED: modifier onlyOwner]
}