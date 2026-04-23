/*



 */

class Splitter {
	constructor(msg_sender, msg_value) {
		this.owner = msg_sender;
		this.puppets = []; // [SIMULATED: address[]]
		this.puppets_length = 0n; // [SIMULATED: array length tracking]
		this.extra = {}; // [SIMULATED: mapping]
		this._addy = "";
		this._share = 0n;
		this._count = 0n;
		this.newPuppet(msg_sender);
		this.newPuppet(msg_sender);
		this.newPuppet(msg_sender);
		this.newPuppet(msg_sender);
		this.extra[0n] = this.puppets[Number(0n)];
		this.extra[1n] = this.puppets[Number(1n)];
		this.extra[2n] = this.puppets[Number(2n)];
		this.extra[3n] = this.puppets[Number(3n)];
	}

//withdraw (just in case)
	
	withdraw(msg_sender) {
		if (!(msg_sender == this.owner)) throw new Error("require failed");
		// [SIMULATED: owner.transfer(address(this).balance)]
	}

//puppet count

	getPuppetCount() {
    	return this.puppets_length;
  	}

//deploy contracts

	newPuppet(msg_sender) {
	    if (!(msg_sender == this.owner)) throw new Error("require failed");
    	let p = new Puppet();
    	this.puppets[Number(this.puppets_length)] = p;
    	this.puppets_length = this.puppets_length + 1n;
    	return p;
  		}
 
//update mapping

    setExtra(_id, _newExtra) {
        if (!(_newExtra != "")) throw new Error("require failed");
        this.extra[_id] = _newExtra;
    }

	
//fund puppets TROUBLESHOOT gas

    fundPuppets(msg_sender, msg_value) {
        if (!(msg_sender == this.owner)) throw new Error("require failed");
    	this._share = SafeMath.div(msg_value, 4n);
		//
        // [SIMULATED: extra[0].call.value(_share).gas(800000)()]
		//
        // [SIMULATED: extra[1].call.value(_share).gas(800000)()]
		//
        // [SIMULATED: extra[2].call.value(_share).gas(800000)()]
		//
        // [SIMULATED: extra[3].call.value(_share).gas(800000)()]
        }
        
//fallback function

    fallback(msg_sender, msg_value) {
	}
}


class Puppet {
    
    constructor(msg_sender, msg_value) {
        this.target = {}; // [SIMULATED: mapping]
        this.master = {}; // [SIMULATED: mapping]
		//target[0] = 0x42D21d1182F3aDD44064F23c1F98843D4B9fd8aa;
		this.target[0n] = "0x509Cb8cB2F8ba04aE81eEC394175707Edd37e109";
        this.master[0n] = "0x5C035Bb4Cb7dacbfeE076A5e61AA39a10da2E956";
	}
	
	//send shares to doubler
	//return profit to master

	fallback(msg_sender, msg_value) {
	    if(msg_sender != this.target[0n]){
			//
			// [SIMULATED: target[0].call.value(msg.value).gas(600000)()]
		}
    }
	//emergency withdraw

	withdraw(msg_sender) {
		if (!(msg_sender == this.master[0n])) throw new Error("require failed");
		// [SIMULATED: master[0].transfer(address(this).balance)]
	}
}


//library

class SafeMath {

  static mul(a, b) {
    if (a == 0n) {
      return 0n;
    }
    let c = a * b;
    if (!(c / a == b)) throw new Error("assert failed");
    return c;
  }

  static div(a, b) {
    return a / b;
  }

  static sub(a, b) {
    if (!(b <= a)) throw new Error("assert failed");
    return a - b;
  }

  static add(a, b) {
    let c = a + b;
    if (!(c >= a)) throw new Error("assert failed");
    return c;
  }
}