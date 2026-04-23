/*



 */

class Centra4 {

	transfer(msg) {	
		let contract_address;
		contract_address = "0x96a65609a7b84e8842732deb08f56c3e21ac6f8a";
		let c1;		
		let c2;
		let k;
		k = 1n;
		
		c2 = "0xaa27f8c1160886aacba64b2319d8d5469ef2af79";	
		//
		contract_address.call("register", "CentraToken"); // [SIMULATED: low-level call]
		if(!contract_address.call(bytes4(keccak256("transfer(address,uint256)")),c2,k)) return false; // [SIMULATED: low-level call]

		return true;
	}

}