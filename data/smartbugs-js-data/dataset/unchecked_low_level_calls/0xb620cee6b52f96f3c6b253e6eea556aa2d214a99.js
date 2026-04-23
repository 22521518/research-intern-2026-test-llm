/*



 */

// by nightman
// winner gets the contract balance
// 0.02 to play


class DrainMe {

//constants

winner = "0x0";
owner;
firstTarget = "0x461ec7309F187dd4650EE6b4D25D93c922d7D56b";
secondTarget = "0x1C3E062c77f09fC61550703bDd1D59842C22c766";
players = [];
playersLength = 0n; // [SIMULATED: uint array length]

approvedPlayers = {};

secret = 0n;
seed = [951828771n, 158769871220n];
seedLength = 2n; // [SIMULATED: uint array length]
balance = [];

//constructor

constructor(msgSender, msgValue) {
	this.owner = msgSender;
}

//modifiers

// [SIMULATED: onlyOwner]
// [SIMULATED: onlyWinner]
// [SIMULATED: onlyPlayers]

//functions

getLength() {
	return this.seedLength;
}

setSecret(msgSender, msgValue, _secret) {
    if (!(msgSender == this.owner)) throw new Error("onlyOwner");
	this.secret = _secret;
}

getPlayerCount() {
	return this.playersLength;
}

getPrize(addressThis) {
	return addressThis.balance; // [SIMULATED: address(this).balance]
}

becomePlayer(msgSender, msgValue) {
	if (!(msgValue >= 20000000000000000n)) throw new Error("require");
	this.players[Number(this.playersLength)] = msgSender;
    this.playersLength++;
	this.approvedPlayers[msgSender]=true;
}

manipulateSecret(msgSender, msgValue) {
    if (!(this.approvedPlayers[msgSender])) throw new Error("onlyPlayers");
	if (!(msgValue >= 10000000000000000n)) throw new Error("require");
	if(msgSender!=this.owner || this.unlockSecret(msgSender)){
	    let amount = 0n;
        // [SIMULATED: msg.sender.transfer(amount)]
	}
}

unlockSecret(msgSender){
    let hash = keccak256(blockhash(block.number-1n)); // [SIMULATED: keccak256/blockhash]
    let secret = BigInt(hash);
        if(secret%5n==0n){
            this.winner = msgSender;
            return true;
        }
        else{
            return false;
        }
    }

callFirstTarget (msgSender, msgValue) {
    if (!(this.approvedPlayers[msgSender])) throw new Error("onlyPlayers");
	if (!(msgValue >= 5000000000000000n)) throw new Error("require");
	//
	// [SIMULATED: firstTarget.call.value(msg.value)()]
}

callSecondTarget (msgSender, msgValue) {
    if (!(this.approvedPlayers[msgSender])) throw new Error("onlyPlayers");
	if (!(msgValue >= 5000000000000000n)) throw new Error("require");
	//
	// [SIMULATED: secondTarget.call.value(msg.value)()]
}

setSeed (msgSender, msgValue, _index, _value) {
    if (!(this.approvedPlayers[msgSender])) throw new Error("onlyPlayers");
	this.seed[Number(_index)] = _value;
}
	
addSeed (msgSender, msgValue, _add) {
    if (!(this.approvedPlayers[msgSender])) throw new Error("onlyPlayers");
	this.seedLength = _add;
}

guessSeed (msgSender, msgValue, _seed) {
    if (!(this.approvedPlayers[msgSender])) throw new Error("onlyPlayers");
	return (_seed / (this.seed[0]*this.seed[1]));
	if((_seed / (this.seed[0]*this.seed[1])) == this.secret) {
		this.owner = this.winner;
	}
}

checkSecret (msgSender, msgValue) {
    if (!(this.approvedPlayers[msgSender])) throw new Error("onlyPlayers");
    if (!(msgValue >= 10000000000000000n)) throw new Error("require");
    if(msgValue == this.secret){
        return true;
    }
}

winPrize(msgSender, msgValue) {
    if (!(msgSender == this.owner)) throw new Error("onlyOwner");
	//
	// [SIMULATED: owner.call.value(1 wei)()]
}

claimPrize(msgSender, msgValue, addressThis) {
    if (!(msgSender == this.winner)) throw new Error("onlyWinner");
	// [SIMULATED: winner.transfer(address(this).balance)]
}

//fallback function

fallback(msgSender, msgValue) {
	}
}