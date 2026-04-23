/*



 */

 // https://etherscan.io/address/0xf91546835f756da0c10cfa0cda95b15577b84aa7#code

 class Token {
     /* This is a slight change to the ERC20 base standard.
     function totalSupply() constant returns (uint256 supply);
     is replaced with:
     uint256 public totalSupply;
     This automatically creates a getter function for the totalSupply.
     This is moved to the base contract since public getter functions are not
     currently recognised as an implementation of the matching abstract
     function by the compiler.
     */
     /// total amount of tokens
     totalSupply = 0n;

     /// @param _owner The address from which the balance will be retrieved
     /// @return The balance
     balanceOf(_owner) {}

     /// @notice send `_value` token to `_to` from `msg.sender`
     /// @param _to The address of the recipient
     /// @param _value The amount of token to be transferred
     /// @return Whether the transfer was successful or not
     transfer(_to, _value, msgSender) {}

     /// @notice send `_value` token to `_to` from `_from` on the condition it is approved by `_from`
     /// @param _from The address of the sender
     /// @param _to The address of the recipient
     /// @param _value The amount of token to be transferred
     /// @return Whether the transfer was successful or not
     transferFrom(_from, _to, _value, msgSender) {}

     /// @notice `msg.sender` approves `_spender` to spend `_value` tokens
     /// @param _spender The address of the account able to transfer the tokens
     /// @param _value The amount of tokens to be approved for transfer
     /// @return Whether the approval was successful or not
     approve(_spender, _value, msgSender) {}

     /// @param _owner The address of the account owning tokens
     /// @param _spender The address of the account able to transfer the tokens
     /// @return Amount of remaining tokens allowed to spent
     allowance(_owner, _spender) {}

     // event Transfer(address indexed _from, address indexed _to, uint256 _value);
     // event Approval(address indexed _owner, address indexed _spender, uint256 _value);
 }

 class ECTools {

     // @dev Recovers the address which has signed a message
     // @thanks https://gist.github.com/axic/5b33912c6f61ae6fd96d6c4a47afde6d
     static recoverSigner(_hashedMsg, _sig) {
         if (!(_hashedMsg !== 0x0000000000000000000000000000000000000000000000000000000000000000n)) throw new Error("...");

         // need this for test RPC
         let prefix = "\x19Ethereum Signed Message:\n32";
         let prefixedHash = keccak256(abi.encodePacked(prefix, _hashedMsg)); // [SIMULATED: keccak256/abi]

         if (_sig.length !== 132) {
             return 0x0;
         }
         let r;
         let s;
         let v;
         let sig = hexstrToBytes(substring(_sig, 2n, 132n));
         // assembly {
         //     r := mload(add(sig, 32))
         //     s := mload(add(sig, 64))
         //     v := byte(0, mload(add(sig, 96)))
         // }
         if (v < 27n) {
             v += 27n;
         }
         if (v < 27n || v > 28n) {
             return 0x0;
         }
         return ecrecover(prefixedHash, v, r, s); // [SIMULATED: ecrecover]
     }

     // @dev Verifies if the message is signed by an address
     static isSignedBy(_hashedMsg, _sig, _addr) {
         if (!(_addr !== 0x0)) throw new Error("...");

         return _addr === recoverSigner(_hashedMsg, _sig);
     }

     // @dev Converts an hexstring to bytes
     static hexstrToBytes(_hexstr) {
         let len = BigInt(_hexstr.length);
         if (!(len % 2n === 0n)) throw new Error("...");

         let bstr = new Uint8Array(Number(len / 2n));
         let k = 0n;
         let s;
         let r;
         for (let i = 0n; i < len; i += 2n) {
             s = substring(_hexstr, i, i + 1n);
             r = substring(_hexstr, i + 1n, i + 2n);
             let p = parseInt16Char(s) * 16n + parseInt16Char(r);
             bstr[Number(k++)] = uintToBytes32(p)[31];
         }
         return bstr;
     }

     // @dev Parses a hexchar, like 'a', and returns its hex value, in this case 10
     static parseInt16Char(_char) {
         let bresult = _char; // [SIMULATED: bytes conversion]
         // bool decimals = false;
         if ((bresult[0] >= 48n) && (bresult[0] <= 57n)) {
             return BigInt(bresult[0]) - 48n;
         } else if ((bresult[0] >= 65n) && (bresult[0] <= 70n)) {
             return BigInt(bresult[0]) - 55n;
         } else if ((bresult[0] >= 97n) && (bresult[0] <= 102n)) {
             return BigInt(bresult[0]) - 87n;
         } else {
             throw new Error();
         }
     }

     // @dev Converts a uint to a bytes32
     // @thanks https://ethereum.stackexchange.com/questions/4170/how-to-convert-a-uint-to-bytes-in-solidity
     static uintToBytes32(_uint) {
         let b = new Uint8Array(32);
         // assembly {mstore(add(b, 32), _uint)}
         return b;
     }

     // @dev Hashes the signed message
     // @ref https://github.com/ethereum/go-ethereum/issues/3731#issuecomment-293866868
     static toEthereumSignedMessage(_msg) {
         let len = BigInt(_msg.length);
         if (!(len > 0n)) throw new Error("...");
         let prefix = "\x19Ethereum Signed Message:\n";
         return keccak256(abi.encodePacked(prefix, uintToString(len), _msg));
     }

     // @dev Converts a uint in a string
     static uintToString(_uint) {
         let len = 0n;
         let m = _uint + 0n;
         while (m !== 0n) {
             len++;
             m /= 10n;
         }
         let b = new Uint8Array(Number(len));
         let i = len - 1n;
         while (_uint !== 0n) {
             let remainder = _uint % 10n;
             _uint = _uint / 10n;
             b[Number(i--)] = Number(48n + remainder);
         }
         return b.toString();
     }


     // @dev extract a substring
     // @thanks https://ethereum.stackexchange.com/questions/31457/substring-in-solidity
     static substring(_str, _startIndex, _endIndex) {
         let strBytes = _str; // [SIMULATED: bytes conversion]
         if (!(_startIndex <= _endIndex)) throw new Error("...");
         if (!(_startIndex >= 0n)) throw new Error("...");
         if (!(_endIndex <= BigInt(strBytes.length))) throw new Error("...");

         let result = new Uint8Array(Number(_endIndex - _startIndex));
         for (let i = _startIndex; i < _endIndex; i++) {
             result[Number(i - _startIndex)] = strBytes[Number(i)];
         }
         return result.toString();
     }
 }
 class StandardToken extends Token {

     transfer(_to, _value, msgSender) {
         //Default assumes totalSupply can't be over max (2^256 - 1).
         //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
         //Replace the if with this one instead.
         //require(balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]);
         if (!(this.balances[msgSender] >= _value)) throw new Error("...");
         this.balances[msgSender] -= _value;
         this.balances[_to] += _value;
         console.log("Transfer", msgSender, _to, _value);
         return true;
     }

     transferFrom(_from, _to, _value, msgSender) {
         //same as above. Replace this line with the following if you want to protect against wrapping uints.
         //require(balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]);
         if (!(this.balances[_from] >= _value && this.allowed[_from][msgSender] >= _value)) throw new Error("...");
         this.balances[_to] += _value;
         this.balances[_from] -= _value;
         this.allowed[_from][msgSender] -= _value;
         console.log("Transfer", _from, _to, _value);
         return true;
     }

     balanceOf(_owner) {
         return this.balances[_owner];
     }

     approve(_spender, _value, msgSender) {
         this.allowed[msgSender][_spender] = _value;
         console.log("Approval", msgSender, _spender, _value);
         return true;
     }

     allowance(_owner, _spender) {
       return this.allowed[_owner][_spender];
     }

     balances = {};
     allowed = {};
 }

 class HumanStandardToken extends StandardToken {

     /* Public variables of the token */

     /*
     NOTE:
     The following variables are OPTIONAL vanities. One does not have to include them.
     They allow one to customise the token contract & in no way influences the core functionality.
     Some wallets/interfaces might not even bother to look at this information.
     */
     name;                   //fancy name: eg Simon Bucks
     decimals;                //How many decimals to show. ie. There could 1000 base units with 3 decimals. Meaning 0.980 SBX = 980 base units. It's like comparing 1 wei to 1 ether.
     symbol;                 //An identifier: eg SBX
     version = 'H0.1';       //human 0.1 standard. Just an arbitrary versioning scheme.

     constructor(
         _initialAmount,
         _tokenName,
         _decimalUnits,
         _tokenSymbol,
         msgSender
         ) {
         super();
         this.balances[msgSender] = _initialAmount;               // Give the creator all initial tokens
         this.totalSupply = _initialAmount;                        // Update total supply
         this.name = _tokenName;                                   // Set the name for display purposes
         this.decimals = _decimalUnits;                            // Amount of decimals for display purposes
         this.symbol = _tokenSymbol;                               // Set the symbol for display purposes
     }

     /* Approves and then calls the receiving contract */
     approveAndCall(_spender, _value, _extraData, msgSender) {
         this.allowed[msgSender][_spender] = _value;
         console.log("Approval", msgSender, _spender, _value);

         //call the receiveApproval function on the contract you want to be notified. This crafts the function signature manually so one doesn't have to include a contract in here just for this.
         //receiveApproval(address _from, uint256 _value, address _tokenContract, bytes _extraData)
         //it is assumed that when does this that the call *should* succeed, otherwise one would use vanilla approve instead.
         if (!(_spender.call(bytes4(bytes32(keccak256("receiveApproval(address,uint256,address,bytes)"))), msgSender, _value, this, _extraData))) throw new Error("..."); // [SIMULATED: call]
         return true;
     }
 }

 class LedgerChannel {

     NAME = "Ledger Channel";
     VERSION = "0.0.1";

     numChannels = 0n;

     // event DidLCOpen ...
     // event DidLCJoin ...
     // event DidLCDeposit ...
     // event DidLCUpdateState ...
     // event DidLCClose ...
     // event DidVCInit ...
     // event DidVCSettle ...
     // event DidVCClose ...

     // struct Channel ...
     // struct VirtualChannel ...

     virtualChannels = {};
     Channels = {};

     createChannel(
         _lcID,
         _partyI,
         _confirmTime,
         _token,
         _balances, // [eth, token]
         msgSender,
         msgValue
     )
     {
         if (!(this.Channels[_lcID] === undefined || this.Channels[_lcID].partyAddresses[0] === "0x0")) throw new Error("Channel has already been created.");
         if (!(_partyI !== "0x0")) throw new Error("No partyI address provided to LC creation");
         if (!(_balances[0] >= 0n && _balances[1] >= 0n)) throw new Error("Balances cannot be negative");
         // Set initial ledger channel state
         // Alice must execute this and we assume the initial state
         // to be signed from this requirement
         // Alternative is to check a sig as in joinChannel
         this.Channels[_lcID] = { partyAddresses: [msgSender, _partyI], ethBalances: [0n, 0n, 0n, 0n], erc20Balances: [0n, 0n, 0n, 0n], initialDeposit: [0n, 0n], sequence: 0n, confirmTime: 0n, VCrootHash: 0n, LCopenTimeout: 0n, updateLCtimeout: 0n, isOpen: false, isUpdateLCSettling: false, numOpenVC: 0n, token: null };
         this.Channels[_lcID].partyAddresses[0] = msgSender;
         this.Channels[_lcID].partyAddresses[1] = _partyI;

         if(_balances[0] !== 0n) {
             if (!(msgValue === _balances[0])) throw new Error("Eth balance does not match sent value");
             this.Channels[_lcID].ethBalances[0] = msgValue;
         }
         if(_balances[1] !== 0n) {
             this.Channels[_lcID].token = new HumanStandardToken(_balances[1], "", 0, "", this); // [SIMULATED: contract instantiation]
             if (!(this.Channels[_lcID].token.transferFrom(msgSender, this, _balances[1], msgSender))) throw new Error("CreateChannel: token transfer failure");
             this.Channels[_lcID].erc20Balances[0] = _balances[1];
         }

         this.Channels[_lcID].sequence = 0n;
         this.Channels[_lcID].confirmTime = _confirmTime;
         // is close flag, lc state sequence, number open vc, vc root hash, partyA...
         //Channels[_lcID].stateHash = keccak256(uint256(0), uint256(0), uint256(0), bytes32(0x0), bytes32(msg.sender), bytes32(_partyI), balanceA, balanceI);
         this.Channels[_lcID].LCopenTimeout = BigInt(Date.now()) + _confirmTime;
         this.Channels[_lcID].initialDeposit = _balances;

         console.log("DidLCOpen", _lcID, msgSender, _partyI, _balances[0], _token, _balances[1], this.Channels[_lcID].LCopenTimeout);
     }

     LCOpenTimeout(_lcID, msgSender) {
         if (!(msgSender === this.Channels[_lcID].partyAddresses[0] && this.Channels[_lcID].isOpen === false)) throw new Error("...");
         if (!(BigInt(Date.now()) > this.Channels[_lcID].LCopenTimeout)) throw new Error("...");

         if(this.Channels[_lcID].initialDeposit[0] !== 0n) {
             //
             this.Channels[_lcID].partyAddresses[0].transfer(this.Channels[_lcID].ethBalances[0]); // [SIMULATED: transfer]
         }
         if(this.Channels[_lcID].initialDeposit[1] !== 0n) {
             //
             if (!(this.Channels[_lcID].token.transfer(this.Channels[_lcID].partyAddresses[0], this.Channels[_lcID].erc20Balances[0], this))) throw new Error("CreateChannel: token transfer failure");
         }

         console.log("DidLCClose", _lcID, 0n, this.Channels[_lcID].ethBalances[0], this.Channels[_lcID].erc20Balances[0], 0n, 0n);

         // only safe to delete since no action was taken on this channel
         delete this.Channels[_lcID];
     }

     joinChannel(_lcID, _balances, msgSender, msgValue) {
         // require the channel is not open yet
         if (!(this.Channels[_lcID].isOpen === false)) throw new Error("...");
         if (!(msgSender === this.Channels[_lcID].partyAddresses[1])) throw new Error("...");

         if(_balances[0] !== 0n) {
             if (!(msgValue === _balances[0])) throw new Error("state balance does not match sent value");
             this.Channels[_lcID].ethBalances[1] = msgValue;
         }
         if(_balances[1] !== 0n) {
             if (!(this.Channels[_lcID].token.transferFrom(msgSender, this, _balances[1], msgSender))) throw new Error("joinChannel: token transfer failure");
             this.Channels[_lcID].erc20Balances[1] = _balances[1];
         }

         this.Channels[_lcID].initialDeposit[0]+= _balances[0];
         this.Channels[_lcID].initialDeposit[1]+= _balances[1];
         // no longer allow joining functions to be called
         this.Channels[_lcID].isOpen = true;
         this.numChannels++;

         console.log("DidLCJoin", _lcID, _balances[0], _balances[1]);
     }


     // additive updates of monetary state
     // TODO check this for attack vectors
     deposit(_lcID, recipient, _balance, isToken, msgSender, msgValue) {
         if (!(this.Channels[_lcID].isOpen === true)) throw new Error("Tried adding funds to a closed channel");
         if (!(recipient === this.Channels[_lcID].partyAddresses[0] || recipient === this.Channels[_lcID].partyAddresses[1])) throw new Error("...");

         //if(Channels[_lcID].token)

         if (this.Channels[_lcID].partyAddresses[0] === recipient) {
             if(isToken) {
                 if (!(this.Channels[_lcID].token.transferFrom(msgSender, this, _balance, msgSender))) throw new Error("deposit: token transfer failure");
                 this.Channels[_lcID].erc20Balances[2] += _balance;
             } else {
                 if (!(msgValue === _balance)) throw new Error("state balance does not match sent value");
                 this.Channels[_lcID].ethBalances[2] += msgValue;
             }
         }

         if (this.Channels[_lcID].partyAddresses[1] === recipient) {
             if(isToken) {
                 if (!(this.Channels[_lcID].token.transferFrom(msgSender, this, _balance, msgSender))) throw new Error("deposit: token transfer failure");
                 this.Channels[_lcID].erc20Balances[3] += _balance;
             } else {
                 if (!(msgValue === _balance)) throw new Error("state balance does not match sent value");
                 this.Channels[_lcID].ethBalances[3] += msgValue;
             }
         }

         console.log("DidLCDeposit", _lcID, recipient, _balance, isToken);
     }

     // TODO: Check there are no open virtual channels, the client should have cought this before signing a close LC state update
     consensusCloseChannel(
         _lcID,
         _sequence,
         _balances, // 0: ethBalanceA 1:ethBalanceI 2:tokenBalanceA 3:tokenBalanceI
         _sigA,
         _sigI
     )
     {
         // assume num open vc is 0 and root hash is 0x0
         //require(Channels[_lcID].sequence < _sequence);
         if (!(this.Channels[_lcID].isOpen === true)) throw new Error("...");
         let totalEthDeposit = this.Channels[_lcID].initialDeposit[0] + this.Channels[_lcID].ethBalances[2] + this.Channels[_lcID].ethBalances[3];
         let totalTokenDeposit = this.Channels[_lcID].initialDeposit[1] + this.Channels[_lcID].erc20Balances[2] + this.Channels[_lcID].erc20Balances[3];
         if (!(totalEthDeposit === _balances[0] + _balances[1])) throw new Error("...");
         if (!(totalTokenDeposit === _balances[2] + _balances[3])) throw new Error("...");

         let _state = keccak256(
             abi.encodePacked(
                 _lcID,
                 true,
                 _sequence,
                 0n,
                 0n,
                 this.Channels[_lcID].partyAddresses[0],
                 this.Channels[_lcID].partyAddresses[1],
                 _balances[0],
                 _balances[1],
                 _balances[2],
                 _balances[3]
             )
         );

         if (!(this.Channels[_lcID].partyAddresses[0] === ECTools.recoverSigner(_state, _sigA))) throw new Error("...");
         if (!(this.Channels[_lcID].partyAddresses[1] === ECTools.recoverSigner(_state, _sigI))) throw new Error("...");

         this.Channels[_lcID].isOpen = false;

         if(_balances[0] !== 0n || _balances[1] !== 0n) {
             this.Channels[_lcID].partyAddresses[0].transfer(_balances[0]); // [SIMULATED: transfer]
             this.Channels[_lcID].partyAddresses[1].transfer(_balances[1]); // [SIMULATED: transfer]
         }

         if(_balances[2] !== 0n || _balances[3] !== 0n) {
             if (!(this.Channels[_lcID].token.transfer(this.Channels[_lcID].partyAddresses[0], _balances[2], this))) throw new Error("happyCloseChannel: token transfer failure");
             if (!(this.Channels[_lcID].token.transfer(this.Channels[_lcID].partyAddresses[1], _balances[3], this))) throw new Error("happyCloseChannel: token transfer failure");
         }

         this.numChannels--;

         console.log("DidLCClose", _lcID, _sequence, _balances[0], _balances[1], _balances[2], _balances[3]);
     }

     // Byzantine functions

     updateLCstate(
         _lcID,
         updateParams, // [sequence, numOpenVc, ethbalanceA, ethbalanceI, tokenbalanceA, tokenbalanceI]
         _VCroot,
         _sigA,
         _sigI
     )
     {
         let channel = this.Channels[_lcID];
         if (!(channel.isOpen)) throw new Error("...");
         if (!(channel.sequence < updateParams[0])) throw new Error("..."); // do same as vc sequence check
         if (!(channel.ethBalances[0] + channel.ethBalances[1] >= updateParams[2] + updateParams[3])) throw new Error("...");
         if (!(channel.erc20Balances[0] + channel.erc20Balances[1] >= updateParams[4] + updateParams[5])) throw new Error("...");

         if(channel.isUpdateLCSettling === true) {
             if (!(channel.updateLCtimeout > BigInt(Date.now()))) throw new Error("...");
         }

         let _state = keccak256(
             abi.encodePacked(
                 _lcID,
                 false,
                 updateParams[0],
                 updateParams[1],
                 _VCroot,
                 channel.partyAddresses[0],
                 channel.partyAddresses[1],
                 updateParams[2],
                 updateParams[3],
                 updateParams[4],
                 updateParams[5]
             )
         );

         if (!(channel.partyAddresses[0] === ECTools.recoverSigner(_state, _sigA))) throw new Error("...");
         if (!(channel.partyAddresses[1] === ECTools.recoverSigner(_state, _sigI))) throw new Error("...");

         // update LC state
         channel.sequence = updateParams[0];
         channel.numOpenVC = updateParams[1];
         channel.ethBalances[0] = updateParams[2];
         channel.ethBalances[1] = updateParams[3];
         channel.erc20Balances[0] = updateParams[4];
         channel.erc20Balances[1] = updateParams[5];
         channel.VCrootHash = _VCroot;
         channel.isUpdateLCSettling = true;
         channel.updateLCtimeout = BigInt(Date.now()) + channel.confirmTime;

         // make settlement flag

         console.log("DidLCUpdateState", _lcID, updateParams[0], updateParams[1], updateParams[2], updateParams[3], updateParams[4], updateParams[5], _VCroot, channel.updateLCtimeout);
     }

     // supply initial state of VC to "prime" the force push game
     initVCstate(
         _lcID,
         _vcID,
         _proof,
         _partyA,
         _partyB,
         _bond,
         _balances, // 0: ethBalanceA 1:ethBalanceI 2:tokenBalanceA 3:tokenBalanceI
         sigA
     )
     {
         if (!(this.Channels[_lcID].isOpen)) throw new Error("LC is closed.");
         // sub-channel must be open
         if (!(this.virtualChannels[_vcID] === undefined || !this.virtualChannels[_vcID].isClose)) throw new Error("VC is closed.");
         // Check time has passed on updateLCtimeout and has not passed the time to store a vc state
         if (!(this.Channels[_lcID].updateLCtimeout < BigInt(Date.now()))) throw new Error("LC timeout not over.");
         // prevent rentry of initializing vc state
         if (!(this.virtualChannels[_vcID] === undefined || this.virtualChannels[_vcID].updateVCtimeout === 0n)) throw new Error("...");
         // partyB is now Ingrid
         let _initState = keccak256(
             abi.encodePacked(_vcID, 0n, _partyA, _partyB, _bond[0], _bond[1], _balances[0], _balances[1], _balances[2], _balances[3])
         );

         // Make sure Alice has signed initial vc state (A/B in oldState)
         if (!(_partyA === ECTools.recoverSigner(_initState, sigA))) throw new Error("...");

         // Check the oldState is in the root hash
         if (!(this._isContained(_initState, _proof, this.Channels[_lcID].VCrootHash) === true)) throw new Error("...");

         this.virtualChannels[_vcID] = { isClose: false, isInSettlementState: true, sequence: 0n, challenger: "0x0", updateVCtimeout: BigInt(Date.now()) + this.Channels[_lcID].confirmTime, partyA: _partyA, partyB: _partyB, partyI: "0x0", ethBalances: [_balances[0], _balances[1]], erc20Balances: [_balances[2], _balances[3]], bond: _bond, token: null };

         console.log("DidVCInit", _lcID, _vcID, _proof, 0n, _partyA, _partyB, _balances[0], _balances[1]);
     }

     //TODO: verify state transition since the hub did not agree to this state
     // make sure the A/B balances are not beyond ingrids bonds
     // Params: vc init state, vc final balance, vcID
     settleVC(
         _lcID,
         _vcID,
         updateSeq,
         _partyA,
         _partyB,
         updateBal, // [ethupdateBalA, ethupdateBalB, tokenupdateBalA, tokenupdateBalB]
         sigA,
         msgSender
     )
     {
         if (!(this.Channels[_lcID].isOpen)) throw new Error("LC is closed.");
         // sub-channel must be open
         if (!(this.virtualChannels[_vcID] === undefined || !this.virtualChannels[_vcID].isClose)) throw new Error("VC is closed.");
         if (!(this.virtualChannels[_vcID].sequence < updateSeq)) throw new Error("VC sequence is higher than update sequence.");
         if (!(
             this.virtualChannels[_vcID].ethBalances[1] < updateBal[1] && this.virtualChannels[_vcID].erc20Balances[1] < updateBal[3]
         )) throw new Error("State updates may only increase recipient balance.");
         if (!(
             this.virtualChannels[_vcID].bond[0] === updateBal[0] + updateBal[1] &&
             this.virtualChannels[_vcID].bond[1] === updateBal[2] + updateBal[3]
         )) throw new Error("Incorrect balances for bonded amount");
         // Check time has passed on updateLCtimeout and has not passed the time to store a vc state
         // virtualChannels[_vcID].updateVCtimeout should be 0 on uninitialized vc state, and this should
         // fail if initVC() isn't called first
         // require(Channels[_lcID].updateLCtimeout < now && now < virtualChannels[_vcID].updateVCtimeout);
         if (!(this.Channels[_lcID].updateLCtimeout < BigInt(Date.now()))) throw new Error("for testing!");

         let _updateState = keccak256(
             abi.encodePacked(
                 _vcID,
                 updateSeq,
                 _partyA,
                 _partyB,
                 this.virtualChannels[_vcID].bond[0],
                 this.virtualChannels[_vcID].bond[1],
                 updateBal[0],
                 updateBal[1],
                 updateBal[2],
                 updateBal[3]
             )
         );

         // Make sure Alice has signed a higher sequence new state
         if (!(this.virtualChannels[_vcID].partyA === ECTools.recoverSigner(_updateState, sigA))) throw new Error("...");

         // store VC data
         // we may want to record who is initiating on-chain settles
         this.virtualChannels[_vcID].challenger = msgSender;
         this.virtualChannels[_vcID].sequence = updateSeq;

         // channel state
         this.virtualChannels[_vcID].ethBalances[0] = updateBal[0];
         this.virtualChannels[_vcID].ethBalances[1] = updateBal[1];
         this.virtualChannels[_vcID].erc20Balances[0] = updateBal[2];
         this.virtualChannels[_vcID].erc20Balances[1] = updateBal[3];

         this.virtualChannels[_vcID].updateVCtimeout = BigInt(Date.now()) + this.Channels[_lcID].confirmTime;

         console.log("DidVCSettle", _lcID, _vcID, updateSeq, updateBal[0], updateBal[1], msgSender, this.virtualChannels[_vcID].updateVCtimeout);
     }

     closeVirtualChannel(_lcID, _vcID) {
         // require(updateLCtimeout > now)
         if (!(this.Channels[_lcID].isOpen)) throw new Error("LC is closed.");
         if (!(this.virtualChannels[_vcID].isInSettlementState)) throw new Error("VC is not in settlement state.");
         if (!(this.virtualChannels[_vcID].updateVCtimeout < BigInt(Date.now()))) throw new Error("Update vc timeout has not elapsed.");
         if (!(this.virtualChannels[_vcID] === undefined || !this.virtualChannels[_vcID].isClose)) throw new Error("VC is already closed");
         // reduce the number of open virtual channels stored on LC
         this.Channels[_lcID].numOpenVC--;
         // close vc flags
         this.virtualChannels[_vcID].isClose = true;
         // re-introduce the balances back into the LC state from the settled VC
         // decide if this lc is alice or bob in the vc
         if(this.virtualChannels[_vcID].partyA === this.Channels[_lcID].partyAddresses[0]) {
             this.Channels[_lcID].ethBalances[0] += this.virtualChannels[_vcID].ethBalances[0];
             this.Channels[_lcID].ethBalances[1] += this.virtualChannels[_vcID].ethBalances[1];

             this.Channels[_lcID].erc20Balances[0] += this.virtualChannels[_vcID].erc20Balances[0];
             this.Channels[_lcID].erc20Balances[1] += this.virtualChannels[_vcID].erc20Balances[1];
         } else if (this.virtualChannels[_vcID].partyB === this.Channels[_lcID].partyAddresses[0]) {
             this.Channels[_lcID].ethBalances[0] += this.virtualChannels[_vcID].ethBalances[1];
             this.Channels[_lcID].ethBalances[1] += this.virtualChannels[_vcID].ethBalances[0];

             this.Channels[_lcID].erc20Balances[0] += this.virtualChannels[_vcID].erc20Balances[1];
             this.Channels[_lcID].erc20Balances[1] += this.virtualChannels[_vcID].erc20Balances[0];
         }

         console.log("DidVCClose", _lcID, _vcID, this.virtualChannels[_vcID].erc20Balances[0], this.virtualChannels[_vcID].erc20Balances[1]);
     }


     // todo: allow ethier lc.end-user to nullify the settled LC state and return to off-chain
     byzantineCloseChannel(_lcID) {
         let channel = this.Channels[_lcID];

         // check settlement flag
         if (!(channel.isOpen)) throw new Error("Channel is not open");
         if (!(channel.isUpdateLCSettling === true)) throw new Error("...");
         if (!(channel.numOpenVC === 0n)) throw new Error("...");
         if (!(channel.updateLCtimeout < BigInt(Date.now()))) throw new Error("LC timeout over.");

         // if off chain state update didnt reblance deposits, just return to deposit owner
         let totalEthDeposit = channel.initialDeposit[0] + channel.ethBalances[2] + channel.ethBalances[3];
         let totalTokenDeposit = channel.initialDeposit[1] + channel.erc20Balances[2] + channel.erc20Balances[3];

         let possibleTotalEthBeforeDeposit = channel.ethBalances[0] + channel.ethBalances[1];
         let possibleTotalTokenBeforeDeposit = channel.erc20Balances[0] + channel.erc20Balances[1];

         if(possibleTotalEthBeforeDeposit < totalEthDeposit) {
             channel.ethBalances[0]+=channel.ethBalances[2];
             channel.ethBalances[1]+=channel.ethBalances[3];
         } else {
             if (!(possibleTotalEthBeforeDeposit === totalEthDeposit)) throw new Error("...");
         }

         if(possibleTotalTokenBeforeDeposit < totalTokenDeposit) {
             channel.erc20Balances[0]+=channel.erc20Balances[2];
             channel.erc20Balances[1]+=channel.erc20Balances[3];
         } else {
             if (!(possibleTotalTokenBeforeDeposit === totalTokenDeposit)) throw new Error("...");
         }

         // reentrancy
         let ethbalanceA = channel.ethBalances[0];
         let ethbalanceI = channel.ethBalances[1];
         let tokenbalanceA = channel.erc20Balances[0];
         let tokenbalanceI = channel.erc20Balances[1];

         channel.ethBalances[0] = 0n;
         channel.ethBalances[1] = 0n;
         channel.erc20Balances[0] = 0n;
         channel.erc20Balances[1] = 0n;

         if(ethbalanceA !== 0n || ethbalanceI !== 0n) {
             channel.partyAddresses[0].transfer(ethbalanceA); // [SIMULATED: transfer]
             channel.partyAddresses[1].transfer(ethbalanceI); // [SIMULATED: transfer]
         }

         if(tokenbalanceA !== 0n || tokenbalanceI !== 0n) {
             if (!(
                 channel.token.transfer(channel.partyAddresses[0], tokenbalanceA, this)
             )) throw new Error("byzantineCloseChannel: token transfer failure");
             if (!(
                 channel.token.transfer(channel.partyAddresses[1], tokenbalanceI, this)
             )) throw new Error("byzantineCloseChannel: token transfer failure");
         }

         channel.isOpen = false;
         this.numChannels--;

         console.log("DidLCClose", _lcID, channel.sequence, ethbalanceA, ethbalanceI, tokenbalanceA, tokenbalanceI);
     }

     _isContained(_hash, _proof, _root) {
         let cursor = _hash;
         let proofElem;

         for (let i = 64n; i <= BigInt(_proof.length); i += 32n) {
             // assembly { proofElem := mload(add(_proof, i)) }
             proofElem = _proof[Number(i)]; // [SIMULATED: mload]

             if (cursor < proofElem) {
                 cursor = keccak256(abi.encodePacked(cursor, proofElem));
             } else {
                 cursor = keccak256(abi.encodePacked(proofElem, cursor));
             }
         }

         return cursor === _root;
     }

     //Struct Getters
     getChannel(id) {
         let channel = this.Channels[id];
         return [
             channel.partyAddresses,
             channel.ethBalances,
             channel.erc20Balances,
             channel.initialDeposit,
             channel.sequence,
             channel.confirmTime,
             channel.VCrootHash,
             channel.LCopenTimeout,
             channel.updateLCtimeout,
             channel.isOpen,
             channel.isUpdateLCSettling,
             channel.numOpenVC
         ];
     }

     getVirtualChannel(id) {
         let virtualChannel = this.virtualChannels[id];
         return [
             virtualChannel.isClose,
             virtualChannel.isInSettlementState,
             virtualChannel.sequence,
             virtualChannel.challenger,
             virtualChannel.updateVCtimeout,
             virtualChannel.partyA,
             virtualChannel.partyB,
             virtualChannel.partyI,
             virtualChannel.ethBalances,
             virtualChannel.erc20Balances,
             virtualChannel.bond
         ];
     }
 }