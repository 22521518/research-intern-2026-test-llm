/*



 */

// [SIMULATED: pragma solidity ^0.4.24;]

class ERC20 {
    // [SIMULATED: function totalSupply() constant returns (uint supply);]
    // [SIMULATED: function balanceOf( address who ) constant returns (uint value);]
    // [SIMULATED: function allowance( address owner, address spender ) constant returns (uint _allowance);]

    // [SIMULATED: function transfer( address to, uint value) returns (bool ok);]
    // [SIMULATED: function transferFrom( address from, address to, uint value) returns (bool ok);]
    // [SIMULATED: function approve( address spender, uint value ) returns (bool ok);]

    // [SIMULATED: event Transfer( address indexed from, address indexed to, uint value);]
    // [SIMULATED: event Approval( address indexed owner, address indexed spender, uint value);]
}
/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
class Ownable {
  constructor() {
    this.owner = null;
  }

  address; // [SIMULATED: public owner;]

  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  Ownable(msg_sender) {
    this.owner = msg_sender;
  }


  /**
   * @dev Throws if called by any account other than the owner.
   */
  // [SIMULATED: modifier onlyOwner() { ... }]


  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */
  transferOwnership(newOwner, msg_sender) {
    if (msg_sender !== this.owner) throw new Error("onlyOwner");
    if (newOwner !== "0x0000000000000000000000000000000000000000") {
      this.owner = newOwner;
    }
  }

}

/// @title Interface for contracts conforming to ERC-721: Non-Fungible Tokens
/// @author Dieter Shirley <dete@axiomzen.co> (https://github.com/dete)
class ERC721 {
    // Required methods
    // [SIMULATED: function totalSupply() public view returns (uint256 total);]
    // [SIMULATED: function balanceOf(address _owner) public view returns (uint256 balance);]
    // [SIMULATED: function ownerOf(uint256 _tokenId) external view returns (address owner);]
    // [SIMULATED: function approve(address _to, uint256 _tokenId) external;]
    // [SIMULATED: function transfer(address _to, uint256 _tokenId) external;]
    // [SIMULATED: function transferFrom(address _from, address _to, uint256 _tokenId) external;]

    // Events
    // [SIMULATED: event Transfer(address from, address to, uint256 tokenId);]
    // [SIMULATED: event Approval(address owner, address approved, uint256 tokenId);]

    // Optional
    // function name() public view returns (string name);
    // function symbol() public view returns (string symbol);
    // function tokensOfOwner(address _owner) external view returns (uint256[] tokenIds);
    // function tokenMetadata(uint256 _tokenId, string _preferredTransport) public view returns (string infoUrl);

    // ERC-165 Compatibility (https://github.com/ethereum/EIPs/issues/165)
    // [SIMULATED: function supportsInterface(bytes4 _interfaceID) external view returns (bool);]
}

class GeneScienceInterface {
    /// @dev simply a boolean to indicate this is the contract we expect to be
    // [SIMULATED: function isGeneScience() public pure returns (bool);]

    /// @dev given genes of kitten 1 & 2, return a genetic combination - may have a random factor
    /// @param genes1 genes of mom
    /// @param genes2 genes of sire
    /// @return the genes that are supposed to be passed down the child
    // [SIMULATED: function mixGenes(uint256[2] genes1, uint256[2] genes2,uint256 g1,uint256 g2, uint256 targetBlock) public returns (uint256[2]);]

    // [SIMULATED: function getPureFromGene(uint256[2] gene) public view returns(uint256);]

    /// @dev get sex from genes 0: female 1: male
    // [SIMULATED: function getSex(uint256[2] gene) public view returns(uint256);]

    /// @dev get wizz type from gene
    // [SIMULATED: function getWizzType(uint256[2] gene) public view returns(uint256);]

    // [SIMULATED: function clearWizzType(uint256[2] _gene) public returns(uint256[2]);]
}

/// @title A facet of PandaCore that manages special access privileges.
/// @author Axiom Zen (https://www.axiomzen.co)
/// @dev See the PandaCore contract documentation to understand how the various contract facets are arranged.
class PandaAccessControl {
    // This facet controls access control for CryptoPandas. There are four roles managed here:
    //
    //     - The CEO: The CEO can reassign other roles and change the addresses of our dependent smart
    //         contracts. It is also the only role that can unpause the smart contract. It is initially
    //         set to the address that created the smart contract in the PandaCore constructor.
    //
    //     - The CFO: The CFO can withdraw funds from PandaCore and its auction contracts.
    //
    //     - The COO: The COO can release gen0 pandas to auction, and mint promo cats.
    //
    // It should be noted that these roles are distinct without overlap in their access abilities, the
    // abilities listed for each role above are exhaustive. In particular, while the CEO can assign any
    // address to any role, the CEO address itself doesn't have the ability to act in those roles. This
    // restriction is intentional so that we aren't tempted to use the CEO address frequently out of
    // convenience. The less we use an address, the less likely it is that we somehow compromise the
    // account.

    /// @dev Emited when contract is upgraded - See README.md for updgrade plan
    // [SIMULATED: event ContractUpgrade(address newContract);]

    // The addresses of the accounts (or contracts) that can execute actions within each roles.
    ceoAddress; // [SIMULATED: public ceoAddress;]
    cfoAddress; // [SIMULATED: public cfoAddress;]
    cooAddress; // [SIMULATED: public cooAddress;]

    // @dev Keeps track whether the contract is paused. When that is true, most actions are blocked
    paused = false; // [SIMULATED: public paused = false;]

    /// @dev Access modifier for CEO-only functionality
    // [SIMULATED: modifier onlyCEO() { ... }]

    /// @dev Access modifier for CFO-only functionality
    // [SIMULATED: modifier onlyCFO() { ... }]

    /// @dev Access modifier for COO-only functionality
    // [SIMULATED: modifier onlyCOO() { ... }]

    // [SIMULATED: modifier onlyCLevel() { ... }]

    /// @dev Assigns a new address to act as the CEO. Only available to the current CEO.
    /// @param _newCEO The address of the new CEO
    setCEO(_newCEO, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        if (!(_newCEO !== "0x0000000000000000000000000000000000000000")) throw new Error("require(_newCEO != address(0))");

        this.ceoAddress = _newCEO;
    }

    /// @dev Assigns a new address to act as the CFO. Only available to the current CEO.
    /// @param _newCFO The address of the new CFO
    setCFO(_newCFO, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        if (!(_newCFO !== "0x0000000000000000000000000000000000000000")) throw new Error("require(_newCFO != address(0))");

        this.cfoAddress = _newCFO;
    }

    /// @dev Assigns a new address to act as the COO. Only available to the current CEO.
    /// @param _newCOO The address of the new COO
    setCOO(_newCOO, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        if (!(_newCOO !== "0x0000000000000000000000000000000000000000")) throw new Error("require(_newCOO != address(0))");

        this.cooAddress = _newCOO;
    }

    /*** Pausable functionality adapted from OpenZeppelin ***/

    /// @dev Modifier to allow actions only when the contract IS NOT paused
    // [SIMULATED: modifier whenNotPaused() { ... }]

    /// @dev Modifier to allow actions only when the contract IS paused
    // [SIMULATED: modifier whenPaused { ... }]

    /// @dev Called by any "C-level" role to pause the contract. Used only when
    ///  a bug or exploit is detected and we need to limit damage.
    pause(msg_sender) {
        if (!(msg_sender === this.cooAddress || msg_sender === this.ceoAddress || msg_sender === this.cfoAddress)) throw new Error("onlyCLevel");
        if (!(this.paused === false)) throw new Error("whenNotPaused");
        this.paused = true;
    }

    /// @dev Unpauses the smart contract. Can only be called by the CEO, since
    ///  one reason we may pause the contract is when CFO or COO accounts are
    ///  compromised.
    /// @notice This is public rather than external so it can be called by
    ///  derived contracts.
    unpause(msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        if (!(this.paused === true)) throw new Error("whenPaused");
        // can't unpause if contract was upgraded
        this.paused = false;
    }
}








/// @title Base contract for CryptoPandas. Holds all common structs, events and base variables.
/// @author Axiom Zen (https://www.axiomzen.co)
/// @dev See the PandaCore contract documentation to understand how the various contract facets are arranged.
class PandaBase extends PandaAccessControl {
    /*** EVENTS ***/

    GEN0_TOTAL_COUNT = 16200n; // [SIMULATED: public constant GEN0_TOTAL_COUNT = 16200;]
    gen0CreatedCount = 0n; // [SIMULATED: public gen0CreatedCount;]

    /// @dev The Birth event is fired whenever a new kitten comes into existence. This obviously
    ///  includes any time a cat is created through the giveBirth method, but it is also called
    ///  when a new gen0 cat is created.
    // [SIMULATED: event Birth(address owner, uint256 pandaId, uint256 matronId, uint256 sireId, uint256[2] genes);]

    /// @dev Transfer event as defined in current draft of ERC721. Emitted every time a kitten
    ///  ownership is assigned, including births.
    // [SIMULATED: event Transfer(address from, address to, uint256 tokenId);]

    /*** DATA TYPES ***/

    /// @dev The main Panda struct. Every cat in CryptoPandas is represented by a copy
    ///  of this structure, so great care was taken to ensure that it fits neatly into
    ///  exactly two 256-bit words. Note that the order of the members in this structure
    ///  Ref: http://solidity.readthedocs.io/en/develop/miscellaneous.html
    // [SIMULATED: struct Panda { ... }]

    /*** CONSTANTS ***/

    /// @dev A lookup table indicating the cooldown duration after any successful
    ///  breeding action, called "pregnancy time" for matrons and "siring cooldown"
    ///  for sires. Designed such that the cooldown roughly doubles each time a cat
    ///  is bred, encouraging owners not to just keep breeding the same cat over
    ///  and over again. Caps out at one week (a cat can breed an unbounded number
    ///  of times, and the maximum cooldown is always seven days).
    cooldowns = [300n, 1800n, 7200n, 14400n, 28800n, 86400n, 172800n, 259200n, 604800n]; // [SIMULATED: public cooldowns = [...];]

    // An approximation of currently how many seconds are in between blocks.
    secondsPerBlock = 15n; // [SIMULATED: public secondsPerBlock = 15;]

    /*** STORAGE ***/

    /// @dev An array containing the Panda struct for all Pandas in existence. The ID
    ///  of each cat is actually an index into this array. Note that ID 0 is a negacat,
    ///  the unPanda, the mythical beast that is the parent of all gen0 cats. A bizarre
    ///  creature that is both matron and sire... to itself! Has an invalid genetic code.
    ///  In other words, cat ID 0 is invalid... ;-)
    pandas = []; // [SIMULATED: Panda[] pandas;]

    /// @dev A mapping from cat IDs to the address that owns them. All cats have
    ///  some valid owner address, even gen0 cats are created with a non-zero owner.
    pandaIndexToOwner = {}; // [SIMULATED: mapping (uint256 => address) public pandaIndexToOwner;]

    // @dev A mapping from owner address to count of tokens that address owns.
    //  Used internally inside balanceOf() to resolve ownership count.
    ownershipTokenCount = {}; // [SIMULATED: mapping (address => uint256) ownershipTokenCount;]

    /// @dev A mapping from PandaIDs to an address that has been approved to call
    ///  transferFrom(). Each Panda can only have one approved address for transfer
    ///  at any time. A zero value means no approval is outstanding.
    pandaIndexToApproved = {}; // [SIMULATED: mapping (uint256 => address) public pandaIndexToApproved;]

    /// @dev A mapping from PandaIDs to an address that has been approved to use
    ///  this Panda for siring via breedWith(). Each Panda can only have one approved
    ///  address for siring at any time. A zero value means no approval is outstanding.
    sireAllowedToAddress = {}; // [SIMULATED: mapping (uint256 => address) public sireAllowedToAddress;]

    /// @dev The address of the ClockAuction contract that handles sales of Pandas. This
    ///  same contract handles both peer-to-peer sales as well as the gen0 sales which are
    ///  initiated every 15 minutes.
    saleAuction = null; // [SIMULATED: public saleAuction;]

    /// @dev The address of a custom ClockAuction subclassed contract that handles siring
    ///  auctions. Needs to be separate from saleAuction because the actions taken on success
    ///  after a sales and siring auction are quite different.
    siringAuction = null; // [SIMULATED: public siringAuction;]


    /// @dev The address of the sibling contract that is used to implement the sooper-sekret
    ///  genetic combination algorithm.
    geneScience = null; // [SIMULATED: public geneScience;]


    saleAuctionERC20 = null; // [SIMULATED: public saleAuctionERC20;]


    // wizz panda total
    wizzPandaQuota = {}; // [SIMULATED: mapping (uint256 => uint256) public wizzPandaQuota;]
    wizzPandaCount = {}; // [SIMULATED: mapping (uint256 => uint256) public wizzPandaCount;]

    
    /// wizz panda control
    getWizzPandaQuotaOf(_tp) {
        return this.wizzPandaQuota[Number(_tp)];
    }

    getWizzPandaCountOf(_tp) {
        return this.wizzPandaCount[Number(_tp)];
    }

    setTotalWizzPandaOf(_tp, _total, msg_sender) {
        if (!(msg_sender === this.cooAddress || msg_sender === this.ceoAddress || msg_sender === this.cfoAddress)) throw new Error("onlyCLevel");
        if (!(this.wizzPandaQuota[Number(_tp)] === 0n)) throw new Error("require (wizzPandaQuota[_tp]==0)");
        if (!(_total === BigInt(Number(BigInt.asUintN(32, _total))))) throw new Error("require (_total==uint256(uint32(_total)))");
        this.wizzPandaQuota[Number(_tp)] = _total;
    }

    getWizzTypeOf(_id) {
        let _p = this.pandas[Number(_id)];
        return this.geneScience.getWizzType(_p.genes);
    }

    /// @dev Assigns ownership of a specific Panda to an address.
    _transfer(_from, _to, _tokenId) {
        // Since the number of kittens is capped to 2^32 we can't overflow this
        this.ownershipTokenCount[_to] = (this.ownershipTokenCount[_to] || 0n) + 1n;
        // transfer ownership
        this.pandaIndexToOwner[Number(_tokenId)] = _to;
        // When creating new kittens _from is 0x0, but we can't account that address.
        if (_from !== "0x0000000000000000000000000000000000000000") {
            this.ownershipTokenCount[_from] = this.ownershipTokenCount[_from] - 1n;
            // once the kitten is transferred also clear sire allowances
            delete this.sireAllowedToAddress[Number(_tokenId)];
            // clear any previously approved ownership exchange
            delete this.pandaIndexToApproved[Number(_tokenId)];
        }
        // Emit the transfer event.
        console.log("Transfer", _from, _to, _tokenId);
    }

    /// @dev An internal method that creates a new panda and stores it. This
    ///  method doesn't do any checking and should only be called when the
    ///  input data is known to be valid. Will generate both a Birth event
    ///  and a Transfer event.
    /// @param _matronId The panda ID of the matron of this cat (zero for gen0)
    /// @param _sireId The panda ID of the sire of this cat (zero for gen0)
    /// @param _generation The generation number of this cat, must be computed by caller.
    /// @param _genes The panda's genetic code.
    /// @param _owner The inital owner of this cat, must be non-zero (except for the unPanda, ID 0)
    _createPanda(
        _matronId,
        _sireId,
        _generation,
        _genes,
        _owner
    )
    {
        // These requires are not strictly necessary, our calling code should make
        // sure that these conditions are never broken. However! _createPanda() is already
        // an expensive call (for storage), and it doesn't hurt to be especially careful
        // to ensure our data structures are always valid.
        if (!(_matronId === BigInt(Number(BigInt.asUintN(32, _matronId))))) throw new Error("require(_matronId == uint256(uint32(_matronId)))");
        if (!(_sireId === BigInt(Number(BigInt.asUintN(32, _sireId))))) throw new Error("require(_sireId == uint256(uint32(_sireId)))");
        if (!(_generation === BigInt(Number(BigInt.asUintN(16, _generation))))) throw new Error("require(_generation == uint256(uint16(_generation)))");


        // New panda starts with the same cooldown as parent gen/2
        let cooldownIndex = 0n;
        // when contract creation, geneScience ref is null 
        if (this.pandas.length > 0){
            let pureDegree = BigInt(Number(this.geneScience.getPureFromGene(_genes)));
            if (pureDegree === 0n) {
                pureDegree = 1n;
            }
            cooldownIndex = 1000n / pureDegree;
            if (cooldownIndex % 10n < 5n){
                cooldownIndex = cooldownIndex / 10n;
            }else{
                cooldownIndex = cooldownIndex / 10n + 1n;
            }
            cooldownIndex = cooldownIndex - 1n;
            if (cooldownIndex > 8n) {
                cooldownIndex = 8n;
            }
            let _tp = this.geneScience.getWizzType(_genes);
            if (_tp > 0n && (this.wizzPandaQuota[Number(_tp)] || 0n) <= (this.wizzPandaCount[Number(_tp)] || 0n)) {
                _genes = this.geneScience.clearWizzType(_genes);
                _tp = 0n;
            }
            // gensis panda cooldownIndex should be 24 hours
            if (_tp === 1n){
                cooldownIndex = 5n;
            }

            // increase wizz counter
            if (_tp > 0n){
                this.wizzPandaCount[Number(_tp)] = (this.wizzPandaCount[Number(_tp)] || 0n) + 1n;
            }
            // all gen0&gen1 except gensis
            if (_generation <= 1n && _tp !== 1n){
                if (!(this.gen0CreatedCount < this.GEN0_TOTAL_COUNT)) throw new Error("require(gen0CreatedCount<GEN0_TOTAL_COUNT)");
                this.gen0CreatedCount++;
            }
        }

        let _panda = {
            genes: _genes,
            birthTime: BigInt(Math.floor(Date.now() / 1000)),
            cooldownEndBlock: 0n,
            matronId: Number(_matronId),
            sireId: Number(_sireId),
            siringWithId: 0,
            cooldownIndex: Number(cooldownIndex),
            generation: Number(_generation)
        };
        let newKittenId = BigInt(this.pandas.push(_panda) - 1);

        // It's probably never going to happen, 4 billion cats is A LOT, but
        // let's just be 100% sure we never let this happen.
        if (!(newKittenId === BigInt(Number(BigInt.asUintN(32, newKittenId))))) throw new Error("require(newKittenId == uint256(uint32(newKittenId)))");

        // emit the birth event
        console.log("Birth", _owner, newKittenId, BigInt(_panda.matronId), BigInt(_panda.sireId), _panda.genes);

        // This will assign ownership, and also emit the Transfer event as
        // per ERC721 draft
        this._transfer("0x0000000000000000000000000000000000000000", _owner, newKittenId);
        
        return newKittenId;
    }

    // Any C-level can fix how many seconds per blocks are currently observed.
    setSecondsPerBlock(secs, msg_sender) {
        if (!(msg_sender === this.cooAddress || msg_sender === this.ceoAddress || msg_sender === this.cfoAddress)) throw new Error("onlyCLevel");
        if (!(secs < this.cooldowns[0])) throw new Error("require(secs < cooldowns[0])");
        this.secondsPerBlock = secs;
    }
}
/// @title The external contract that is responsible for generating metadata for the pandas,
///  it has one function that will return the data as bytes.
class ERC721Metadata {
    /// @dev Given a token Id, returns a byte array that is supposed to be converted into string.
    getMetadata(_tokenId, _unused) {
        let buffer = [0n, 0n, 0n, 0n];
        let count = 0n;
        if (_tokenId === 1n) {
            buffer[0] = 0x48656c6c6f20576f726c6421203a44n;
            count = 15n;
        } else if (_tokenId === 2n) {
            buffer[0] = 0x4920776f756c6420646566696e6974656c792063686f6f73652061206d656469n;
            buffer[1] = 0x756d206c656e67746820737472696e672e000000000000000000000000000000n;
            count = 49n;
        } else if (_tokenId === 3n) {
            buffer[0] = 0x4c6f72656d20697073756d20646f6c6f722073697420616d65742c206d692065n;
            buffer[1] = 0x737420616363756d73616e2064617069627573206175677565206c6f72656d2cn;
            buffer[2] = 0x2074726973746971756520766573746962756c756d2069642c206c696265726fn;
            buffer[3] = 0x207375736369706974207661726975732073617069656e20616c697175616d2en;
            count = 128n;
        }
        return [buffer, count];
    }
}







/// @title The facet of the CryptoPandas core contract that manages ownership, ERC-721 (draft) compliant.
/// @author Axiom Zen (https://www.axiomzen.co)
/// @dev Ref: https://github.com/ethereum/EIPs/issues/721
///  See the PandaCore contract documentation to understand how the various contract facets are arranged.
class PandaOwnership extends PandaBase {

    /// @notice Name and symbol of the non fungible token, as defined in ERC721.
    name = "PandaEarth"; // [SIMULATED: public constant name = "PandaEarth";]
    symbol = "PE"; // [SIMULATED: public constant symbol = "PE";]

    // [SIMULATED: bytes4 constant InterfaceSignature_ERC165 = ...;]
    // [SIMULATED: bytes4 constant InterfaceSignature_ERC721 = ...;]

    /// @notice Introspection interface as per ERC-165 (https://github.com/ethereum/EIPs/issues/165).
    ///  Returns true for any standardized interfaces implemented by this contract. We implement
    ///  ERC-165 (obviously!) and ERC-721.
    supportsInterface(_interfaceID) {
        // DEBUG ONLY
        //require((InterfaceSignature_ERC165 == 0x01ffc9a7) && (InterfaceSignature_ERC721 == 0x9a20483d));

        return ((_interfaceID === 0x01ffc9a7) || (_interfaceID === 0x9a20483d));
    }

    // Internal utility functions: These functions all assume that their input arguments
    // are valid. We leave it to public methods to sanitize their inputs and follow
    // the required logic.

    /// @dev Checks if a given address is the current owner of a particular Panda.
    /// @param _claimant the address we are validating against.
    /// @param _tokenId kitten id, only valid when > 0
    _owns(_claimant, _tokenId) {
        return this.pandaIndexToOwner[Number(_tokenId)] === _claimant;
    }

    /// @dev Checks if a given address currently has transferApproval for a particular Panda.
    /// @param _claimant the address we are confirming kitten is approved for.
    /// @param _tokenId kitten id, only valid when > 0
    _approvedFor(_claimant, _tokenId) {
        return this.pandaIndexToApproved[Number(_tokenId)] === _claimant;
    }

    /// @dev Marks an address as being approved for transferFrom(), overwriting any previous
    ///  approval. Setting _approved to address(0) clears all transfer approval.
    ///  NOTE: _approve() does NOT send the Approval event. This is intentional because
    ///  _approve() and transferFrom() are used together for putting Pandas on auction, and
    ///  there is no value in spamming the log with Approval events in that case.
    _approve(_tokenId, _approved) {
        this.pandaIndexToApproved[Number(_tokenId)] = _approved;
    }

    /// @notice Returns the number of Pandas owned by a specific address.
    /// @param _owner The owner address to check.
    /// @dev Required for ERC-721 compliance
    balanceOf(_owner) {
        return this.ownershipTokenCount[_owner] || 0n;
    }

    /// @notice Transfers a Panda to another address. If transferring to a smart
    ///  contract be VERY CAREFUL to ensure that it is aware of ERC-721 (or
    ///  CryptoPandas specifically) or your Panda may be lost forever. Seriously.
    /// @param _to The address of the recipient, can be a user or contract.
    /// @param _tokenId The ID of the Panda to transfer.
    /// @dev Required for ERC-721 compliance.
    transfer(
        _to,
        _tokenId,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Safety check to prevent against an unexpected 0x0 default.
        if (!(_to !== "0x0000000000000000000000000000000000000000")) throw new Error("require(_to != address(0))");
        // Disallow transfers to this contract to prevent accidental misuse.
        // The contract should never own any pandas (except very briefly
        // after a gen0 cat is created and before it goes on auction).
        if (!(_to !== this)) throw new Error("require(_to != address(this))");
        // Disallow transfers to the auction contracts to prevent accidental
        // misuse. Auction contracts should only take ownership of pandas
        // through the allow + transferFrom flow.
        if (!(_to !== this.saleAuction)) throw new Error("require(_to != address(saleAuction))");
        if (!(_to !== this.siringAuction)) throw new Error("require(_to != address(siringAuction))");

        // You can only send your own cat.
        if (!(this._owns(msg_sender, _tokenId))) throw new Error("require(_owns(msg.sender, _tokenId))");

        // Reassign ownership, clear pending approvals, emit Transfer event.
        this._transfer(msg_sender, _to, _tokenId);
    }

    /// @notice Grant another address the right to transfer a specific Panda via
    ///  transferFrom(). This is the preferred flow for transfering NFTs to contracts.
    /// @param _to The address to be granted transfer approval. Pass address(0) to
    ///  clear all approvals.
    /// @param _tokenId The ID of the Panda that can be transferred if this call succeeds.
    /// @dev Required for ERC-721 compliance.
    approve(
        _to,
        _tokenId,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Only an owner can grant transfer approval.
        if (!(this._owns(msg_sender, _tokenId))) throw new Error("require(_owns(msg.sender, _tokenId))");

        // Register the approval (replacing any previous approval).
        this._approve(_tokenId, _to);

        // Emit approval event.
        console.log("Approval", msg_sender, _to, _tokenId);
    }

    /// @notice Transfer a Panda owned by another address, for which the calling address
    ///  has previously been granted transfer approval by the owner.
    /// @param _from The address that owns the Panda to be transfered.
    /// @param _to The address that should take ownership of the Panda. Can be any address,
    ///  including the caller.
    /// @param _tokenId The ID of the Panda to be transferred.
    /// @dev Required for ERC-721 compliance.
    transferFrom(
        _from,
        _to,
        _tokenId,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Safety check to prevent against an unexpected 0x0 default.
        if (!(_to !== "0x0000000000000000000000000000000000000000")) throw new Error("require(_to != address(0))");
        // Disallow transfers to this contract to prevent accidental misuse.
        // The contract should never own any pandas (except very briefly
        // after a gen0 cat is created and before it goes on auction).
        if (!(_to !== this)) throw new Error("require(_to != address(this))");
        // Check for approval and valid ownership
        if (!(this._approvedFor(msg_sender, _tokenId))) throw new Error("require(_approvedFor(msg.sender, _tokenId))");
        if (!(this._owns(_from, _tokenId))) throw new Error("require(_owns(_from, _tokenId))");

        // Reassign ownership (also clears pending approvals and emits Transfer event).
        this._transfer(_from, _to, _tokenId);
    }

    /// @notice Returns the total number of Pandas currently in existence.
    /// @dev Required for ERC-721 compliance.
    totalSupply() {
        return BigInt(this.pandas.length) - 1n;
    }

    /// @notice Returns the address currently assigned ownership of a given Panda.
    /// @dev Required for ERC-721 compliance.
    ownerOf(_tokenId)
    {
        let owner = this.pandaIndexToOwner[Number(_tokenId)];

        if (!(owner !== "0x0000000000000000000000000000000000000000")) throw new Error("require(owner != address(0))");
        return owner;
    }

    /// @notice Returns a list of all Panda IDs assigned to an address.
    /// @param _owner The owner whose Pandas we are interested in.
    /// @dev This method MUST NEVER be called by smart contract code. First, it's fairly
    ///  expensive (it walks the entire Panda array looking for cats belonging to owner),
    ///  but it also returns a dynamic array, which is only supported for web3 calls, and
    ///  not contract-to-contract calls.
    tokensOfOwner(_owner) {
        let tokenCount = this.balanceOf(_owner);

        if (tokenCount === 0n) {
            // Return an empty array
            return [];
        } else {
            let result = new Array(Number(tokenCount));
            let totalCats = this.totalSupply();
            let resultIndex = 0;

            // We count on the fact that all cats have IDs starting at 1 and increasing
            // sequentially up to the totalCat count.
            let catId;

            for (catId = 1n; catId <= totalCats; catId++) {
                if (this.pandaIndexToOwner[Number(catId)] === _owner) {
                    result[resultIndex] = catId;
                    resultIndex++;
                }
            }

            return result;
        }
    }

    /// @dev Adapted from memcpy() by @arachnid (Nick Johnson <arachnid@notdot.net>)
    ///  This method is licenced under the Apache License.
    ///  Ref: https://github.com/Arachnid/solidity-stringutils/blob/2f6ca9accb48ae14c66f1437ec50ed19a0616f78/strings.sol
    _memcpy(_dest, _src, _len) {
        // [SIMULATED: assembly { ... }]
    }

    /// @dev Adapted from toString(slice) by @arachnid (Nick Johnson <arachnid@notdot.net>)
    ///  This method is licenced under the Apache License.
    ///  Ref: https://github.com/Arachnid/solidity-stringutils/blob/2f6ca9accb48ae14c66f1437ec50ed19a0616f78/strings.sol
    _toString(_rawBytes, _stringLength) {
        // [SIMULATED: var outputString = new string(_stringLength);]
        // [SIMULATED: assembly { ... }]
        // [SIMULATED: _memcpy(outputPtr, bytesPtr, _stringLength);]
        // [SIMULATED: return outputString;]
    }

}




/// @title A facet of PandaCore that manages Panda siring, gestation, and birth.
/// @author Axiom Zen (https://www.axiomzen.co)
/// @dev See the PandaCore contract documentation to understand how the various contract facets are arranged.
class PandaBreeding extends PandaOwnership {

    GENSIS_TOTAL_COUNT = 100n; // [SIMULATED: public constant GENSIS_TOTAL_COUNT = 100;]

    /// @dev The Pregnant event is fired when two cats successfully breed and the pregnancy
    ///  timer begins for the matron.
    // [SIMULATED: event Pregnant(address owner, uint256 matronId, uint256 sireId, uint256 cooldownEndBlock);]
    /// @dev The Abortion event is fired when two cats breed failed.
    // [SIMULATED: event Abortion(address owner, uint256 matronId, uint256 sireId);]

    /// @notice The minimum payment required to use breedWithAuto(). This fee goes towards
    ///  the gas cost paid by whatever calls giveBirth(), and can be dynamically updated by
    ///  the COO role as the gas price changes.
    autoBirthFee = 2000000000000000n; // [SIMULATED: public autoBirthFee = 2 finney;]

    // Keeps track of number of pregnant pandas.
    pregnantPandas = 0n; // [SIMULATED: public pregnantPandas;]

    childOwner = {}; // [SIMULATED: mapping(uint256 => address) childOwner;]


    /// @dev Update the address of the genetic contract, can only be called by the CEO.
    /// @param _address An address of a GeneScience contract instance to be used from this point forward.
    setGeneScienceAddress(_address, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        let candidateContract = _address;

        // NOTE: verify that a contract is what we expect - https://github.com/Lunyr/crowdsale-contracts/blob/cfadd15986c30521d8ba7d5b6f57b4fefcc7ac38/contracts/LunyrToken.sol#L117
        if (!(candidateContract.isGeneScience())) throw new Error("require(candidateContract.isGeneScience())");

        // Set the new contract address
        this.geneScience = candidateContract;
    }

    /// @dev Checks that a given kitten is able to breed. Requires that the
    ///  current cooldown is finished (for sires) and also checks that there is
    ///  no pending pregnancy.
    _isReadyToBreed(_kit) {
        // In addition to checking the cooldownEndBlock, we also need to check to see if
        // the cat has a pending birth; there can be some period of time between the end
        // of the pregnacy timer and the birth event.
        return (_kit.siringWithId === 0) && (BigInt(_kit.cooldownEndBlock) <= BigInt(0)); // [SIMULATED: block.number]
    }

    /// @dev Check if a sire has authorized breeding with this matron. True if both sire
    ///  and matron have the same owner, or if the sire has given siring permission to
    ///  the matron's owner (via approveSiring()).
    _isSiringPermitted(_sireId, _matronId) {
        let matronOwner = this.pandaIndexToOwner[Number(_matronId)];
        let sireOwner = this.pandaIndexToOwner[Number(_sireId)];

        // Siring is okay if they have same owner, or if the matron's owner was given
        // permission to breed with this sire.
        return (matronOwner === sireOwner || this.sireAllowedToAddress[Number(_sireId)] === matronOwner);
    }

    /// @dev Set the cooldownEndTime for the given Panda, based on its current cooldownIndex.
    ///  Also increments the cooldownIndex (unless it has hit the cap).
    /// @param _kitten A reference to the Panda in storage which needs its timer started.
    _triggerCooldown(_kitten) {
        // Compute an estimation of the cooldown time in blocks (based on current cooldownIndex).
        _kitten.cooldownEndBlock = Number((BigInt(this.cooldowns[_kitten.cooldownIndex]) / this.secondsPerBlock) + 0n); // [SIMULATED: block.number]


        // Increment the breeding count, clamping it at 13, which is the length of the
        // cooldowns array. We could check the array size dynamically, but hard-coding
        // this as a constant saves gas. Yay, Solidity!
        if (_kitten.cooldownIndex < 8 && this.geneScience.getWizzType(_kitten.genes) !== 1n) {
            _kitten.cooldownIndex += 1;
        }
    }

    /// @notice Grants approval to another user to sire with one of your Pandas.
    /// @param _addr The address that will be able to sire with your Panda. Set to
    ///  address(0) to clear all siring approvals for this Panda.
    /// @param _sireId A Panda that you own that _addr will now be able to sire with.
    approveSiring(_addr, _sireId, msg_sender) {
        if (this.paused === true) throw new Error("whenNotPaused");
        if (!(this._owns(msg_sender, _sireId))) throw new Error("require(_owns(msg.sender, _sireId))");
        this.sireAllowedToAddress[Number(_sireId)] = _addr;
    }

    /// @dev Updates the minimum payment required for calling giveBirthAuto(). Can only
    ///  be called by the COO address. (This fee is used to offset the gas cost incurred
    ///  by the autobirth daemon).
    setAutoBirthFee(val, msg_sender) {
        if (msg_sender !== this.cooAddress) throw new Error("onlyCOO");
        this.autoBirthFee = val;
    }

    /// @dev Checks to see if a given Panda is pregnant and (if so) if the gestation
    ///  period has passed.
    _isReadyToGiveBirth(_matron) {
        return (_matron.siringWithId !== 0) && (BigInt(_matron.cooldownEndBlock) <= BigInt(0)); // [SIMULATED: block.number]
    }

    /// @notice Checks that a given kitten is able to breed (i.e. it is not pregnant or
    ///  in the middle of a siring cooldown).
    /// @param _pandaId reference the id of the kitten, any user can inquire about it
    isReadyToBreed(_pandaId) {
        if (!(_pandaId > 0n)) throw new Error("require(_pandaId > 0)");
        let kit = this.pandas[Number(_pandaId)];
        return this._isReadyToBreed(kit);
    }

    /// @dev Checks whether a panda is currently pregnant.
    /// @param _pandaId reference the id of the kitten, any user can inquire about it
    isPregnant(_pandaId) {
        if (!(_pandaId > 0n)) throw new Error("require(_pandaId > 0)");
        // A panda is pregnant if and only if this field is set
        return this.pandas[Number(_pandaId)].siringWithId !== 0;
    }

    /// @dev Internal check to see if a given sire and matron are a valid mating pair. DOES NOT
    ///  check ownership permissions (that is up to the caller).
    /// @param _matron A reference to the Panda struct of the potential matron.
    /// @param _matronId The matron's ID.
    /// @param _sire A reference to the Panda struct of the potential sire.
    /// @param _sireId The sire's ID
    _isValidMatingPair(
        _matron,
        _matronId,
        _sire,
        _sireId
    )
    {
        // A Panda can't breed with itself!
        if (_matronId === _sireId) {
            return false;
        }

        // Pandas can't breed with their parents.
        if (BigInt(_matron.matronId) === _sireId || BigInt(_matron.sireId) === _sireId) {
            return false;
        }
        if (BigInt(_sire.matronId) === _matronId || BigInt(_sire.sireId) === _matronId) {
            return false;
        }

        // We can short circuit the sibling check (below) if either cat is
        // gen zero (has a matron ID of zero).
        if (_sire.matronId === 0 || _matron.matronId === 0) {
            return true;
        }

        // Pandas can't breed with full or half siblings.
        if (_sire.matronId === _matron.matronId || _sire.matronId === _matron.sireId) {
            return false;
        }
        if (_sire.sireId === _matron.matronId || _sire.sireId === _matron.sireId) {
            return false;
        }

        // male should get breed with female
        if (this.geneScience.getSex(_matron.genes) + this.geneScience.getSex(_sire.genes) !== 1n) {
            return false;
        }

        // Everything seems cool! Let's get DTF.
        return true;
    }

    /// @dev Internal check to see if a given sire and matron are a valid mating pair for
    ///  breeding via auction (i.e. skips ownership and siring approval checks).
    _canBreedWithViaAuction(_matronId, _sireId) {
        let matron = this.pandas[Number(_matronId)];
        let sire = this.pandas[Number(_sireId)];
        return this._isValidMatingPair(matron, _matronId, sire, _sireId);
    }

    /// @notice Checks to see if two cats can breed together, including checks for
    ///  ownership and siring approvals. Does NOT check that both cats are ready for
    ///  breeding (i.e. breedWith could still fail until the cooldowns are finished).
    ///  TODO: Shouldn't this check pregnancy and cooldowns?!?
    /// @param _matronId The ID of the proposed matron.
    /// @param _sireId The ID of the proposed sire.
    canBreedWith(_matronId, _sireId) {
        if (!(_matronId > 0n)) throw new Error("require(_matronId > 0)");
        if (!(_sireId > 0n)) throw new Error("require(_sireId > 0)");
        let matron = this.pandas[Number(_matronId)];
        let sire = this.pandas[Number(_sireId)];
        return this._isValidMatingPair(matron, _matronId, sire, _sireId) &&
            this._isSiringPermitted(_sireId, _matronId);
    }

    _exchangeMatronSireId(_matronId, _sireId) {
        if (this.geneScience.getSex(this.pandas[Number(_matronId)].genes) === 1n) {
            return [_sireId, _matronId];
        } else {
            return [_matronId, _sireId];
        }
    }

    /// @dev Internal utility function to initiate breeding, assumes that all breeding
    ///  requirements have been checked.
    _breedWith(_matronId, _sireId, _owner) {
        // make id point real gender
        [_matronId, _sireId] = this._exchangeMatronSireId(_matronId, _sireId);
        // Grab a reference to the Pandas from storage.
        let sire = this.pandas[Number(_sireId)];
        let matron = this.pandas[Number(_matronId)];

        // Mark the matron as pregnant, keeping track of who the sire is.
        matron.siringWithId = Number(_sireId);

        // Trigger the cooldown for both parents.
        this._triggerCooldown(sire);
        this._triggerCooldown(matron);

        // Clear siring permission for both parents. This may not be strictly necessary
        // but it's likely to avoid confusion!
        delete this.sireAllowedToAddress[Number(_matronId)];
        delete this.sireAllowedToAddress[Number(_sireId)];

        // Every time a panda gets pregnant, counter is incremented.
        this.pregnantPandas++;

        this.childOwner[Number(_matronId)] = _owner;

        // Emit the pregnancy event.
        console.log("Pregnant", this.pandaIndexToOwner[Number(_matronId)], _matronId, _sireId, BigInt(matron.cooldownEndBlock));
    }

    /// @notice Breed a Panda you own (as matron) with a sire that you own, or for which you
    ///  have previously been given Siring approval. Will either make your cat pregnant, or will
    ///  fail entirely. Requires a pre-payment of the fee given out to the first caller of giveBirth()
    /// @param _matronId The ID of the Panda acting as matron (will end up pregnant if successful)
    /// @param _sireId The ID of the Panda acting as sire (will begin its siring cooldown if successful)
    breedWithAuto(
        _matronId,
        _sireId,
        msg_value,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Checks for payment.
        if (!(msg_value >= this.autoBirthFee)) throw new Error("require(msg.value >= autoBirthFee)");

        // Caller must own the matron.
        if (!(this._owns(msg_sender, _matronId))) throw new Error("require(_owns(msg.sender, _matronId))");

        // Neither sire nor matron are allowed to be on auction during a normal
        // breeding operation, but we don't need to check that explicitly.
        // For matron: The caller of this function can't be the owner of the matron
        //   because the owner of a Panda on auction is the auction house, and the
        //   auction house will never call breedWith().
        // For sire: Similarly, a sire on auction will be owned by the auction house
        //   and the act of transferring ownership will have cleared any oustanding
        //   siring approval.
        // Thus we don't need to spend gas explicitly checking to see if either cat
        // is on auction.

        // Check that matron and sire are both owned by caller, or that the sire
        // has given siring permission to caller (i.e. matron's owner).
        // Will fail for _sireId = 0
        if (!(this._isSiringPermitted(_sireId, _matronId))) throw new Error("require(_isSiringPermitted(_sireId, _matronId))");

        // Grab a reference to the potential matron
        let matron = this.pandas[Number(_matronId)];

        // Make sure matron isn't pregnant, or in the middle of a siring cooldown
        if (!(this._isReadyToBreed(matron))) throw new Error("require(_isReadyToBreed(matron))");

        // Grab a reference to the potential sire
        let sire = this.pandas[Number(_sireId)];

        // Make sure sire isn't pregnant, or in the middle of a siring cooldown
        if (!(this._isReadyToBreed(sire))) throw new Error("require(_isReadyToBreed(sire))");

        // Test that these cats are a valid mating pair.
        if (!(this._isValidMatingPair(
            matron,
            _matronId,
            sire,
            _sireId
        ))) throw new Error("require(_isValidMatingPair(...))");

        // All checks passed, panda gets pregnant!
        this._breedWith(_matronId, _sireId, msg_sender);
    }

    /// @notice Have a pregnant Panda give birth!
    /// @param _matronId A Panda ready to give birth.
    /// @return The Panda ID of the new kitten.
    /// @dev Looks at a given Panda and, if pregnant and if the gestation period has passed,
    ///  combines the genes of the two parents to create a new kitten. The new Panda is assigned
    ///  to the current owner of the matron. Upon successful completion, both the matron and the
    ///  new kitten will be ready to breed again. Note that anyone can call this function (if they
    ///  are willing to pay the gas!), but the new kitten always goes to the mother's owner.
    giveBirth(
        _matronId,
        _childGenes,
        _factors,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        if (!(msg_sender === this.cooAddress || msg_sender === this.ceoAddress || msg_sender === this.cfoAddress)) throw new Error("onlyCLevel");
        // Grab a reference to the matron in storage.
        let matron = this.pandas[Number(_matronId)];

        // Check that the matron is a valid cat.
        if (!(matron.birthTime !== 0n)) throw new Error("require(matron.birthTime != 0)");

        // Check that the matron is pregnant, and that its time has come!
        if (!(this._isReadyToGiveBirth(matron))) throw new Error("require(_isReadyToGiveBirth(matron))");

        // Grab a reference to the sire in storage.
        let sireId = BigInt(matron.siringWithId);
        let sire = this.pandas[Number(sireId)];

        // Determine the higher generation number of the two parents
        let parentGen = BigInt(matron.generation);
        if (BigInt(sire.generation) > BigInt(matron.generation)) {
            parentGen = BigInt(sire.generation);
        }

        // Call the sooper-sekret gene mixing operation.
        //uint256[2] memory childGenes = geneScience.mixGenes(matron.genes, sire.genes,matron.generation,sire.generation, matron.cooldownEndBlock - 1);
        let childGenes = _childGenes;

        let kittenId = 0n;

        // birth failed
        let probability = (BigInt(this.geneScience.getPureFromGene(matron.genes)) + BigInt(this.geneScience.getPureFromGene(sire.genes))) / 2n + _factors[0];
        if (probability >= (parentGen + 1n) * _factors[1]) {
            probability = probability - (parentGen + 1n) * _factors[1];
        } else {
            probability = 0n;
        }
        if (parentGen === 0n && this.gen0CreatedCount === this.GEN0_TOTAL_COUNT) {
            probability = 0n;
        }
        // [SIMULATED: keccak256(block.blockhash(block.number - 2), now)]
        if (0n % 100n < probability) {
            // Make the new kitten!
            let owner = this.childOwner[Number(_matronId)];
            kittenId = this._createPanda(_matronId, BigInt(matron.siringWithId), parentGen + 1n, childGenes, owner);
        } else {
            console.log("Abortion", this.pandaIndexToOwner[Number(_matronId)], _matronId, sireId);
        }
        // Make the new kitten!
        //address owner = pandaIndexToOwner[_matronId];
        //address owner = childOwner[_matronId];
        //uint256 kittenId = _createPanda(_matronId, matron.siringWithId, parentGen + 1, childGenes, owner);

        // Clear the reference to sire from the matron (REQUIRED! Having siringWithId
        // set is what marks a matron as being pregnant.)
        delete matron.siringWithId;

        // Every time a panda gives birth counter is decremented.
        this.pregnantPandas--;

        // Send the balance fee to the person who made birth happen.
         //
        // [SIMULATED: msg.sender.send(autoBirthFee);]

        delete this.childOwner[Number(_matronId)];

        // return the new kitten's ID
        return kittenId;
    }
}





/// @title Auction Core
/// @dev Contains models, variables, and internal methods for the auction.
/// @notice We omit a fallback function to prevent accidental sends to this contract.
class ClockAuctionBase {

    // Represents an auction on an NFT
    // [SIMULATED: struct Auction { ... }]

    // Reference to contract tracking NFT ownership
    nonFungibleContract = null; // [SIMULATED: public nonFungibleContract;]

    // Cut owner takes on each auction, measured in basis points (1/100 of a percent).
    // Values 0-10,000 map to 0%-100%
    ownerCut = 0n; // [SIMULATED: public ownerCut;]

    // Map from token ID to their corresponding auction.
    tokenIdToAuction = {}; // [SIMULATED: mapping (uint256 => Auction) tokenIdToAuction;]

    // [SIMULATED: event AuctionCreated(uint256 tokenId, uint256 startingPrice, uint256 endingPrice, uint256 duration);]
    // [SIMULATED: event AuctionSuccessful(uint256 tokenId, uint256 totalPrice, address winner);]
    // [SIMULATED: event AuctionCancelled(uint256 tokenId);]

    /// @dev Returns true if the claimant owns the token.
    /// @param _claimant - Address claiming to own the token.
    /// @param _tokenId - ID of token whose ownership to verify.
    _owns(_claimant, _tokenId) {
        return (this.nonFungibleContract.ownerOf(_tokenId) === _claimant);
    }

    /// @dev Escrows the NFT, assigning ownership to this contract.
    /// Throws if the escrow fails.
    /// @param _owner - Current owner address of token to escrow.
    /// @param _tokenId - ID of token whose approval to verify.
    _escrow(_owner, _tokenId) {
        // it will throw if transfer fails
        this.nonFungibleContract.transferFrom(_owner, this, _tokenId);
    }

    /// @dev Transfers an NFT owned by this contract to another address.
    /// Returns true if the transfer succeeds.
    /// @param _receiver - Address to transfer NFT to.
    /// @param _tokenId - ID of token to transfer.
    _transfer(_receiver, _tokenId) {
        // it will throw if transfer fails
        this.nonFungibleContract.transfer(_receiver, _tokenId);
    }

    /// @dev Adds an auction to the list of open auctions. Also fires the
    ///  AuctionCreated event.
    /// @param _tokenId The ID of the token to be put on auction.
    /// @param _auction Auction to add.
    _addAuction(_tokenId, _auction) {
        // Require that all auctions have a duration of
        // at least one minute. (Keeps our math from getting hairy!)
        if (!(_auction.duration >= 60n)) throw new Error("require(_auction.duration >= 1 minutes)");

        this.tokenIdToAuction[Number(_tokenId)] = _auction;

        console.log("AuctionCreated", _tokenId, BigInt(_auction.startingPrice), BigInt(_auction.endingPrice), BigInt(_auction.duration));
    } 

    /// @dev Cancels an auction unconditionally.
    _cancelAuction(_tokenId, _seller) {
        this._removeAuction(_tokenId);
        this._transfer(_seller, _tokenId);
        console.log("AuctionCancelled", _tokenId);
    }

    /// @dev Computes the price and transfers winnings.
    /// Does NOT transfer ownership of token.
    _bid(_tokenId, _bidAmount, msg_sender)
    {
        // Get a reference to the auction struct
        let auction = this.tokenIdToAuction[Number(_tokenId)];

        // Explicitly check that this auction is currently live.
        // (Because of how Ethereum mappings work, we can't just count
        // on the lookup above failing. An invalid _tokenId will just
        // return an auction object that is all zeros.)
        if (!(this._isOnAuction(auction))) throw new Error("require(_isOnAuction(auction))");

        // Check that the bid is greater than or equal to the current price
        let price = this._currentPrice(auction);
        if (!(_bidAmount >= price)) throw new Error("require(_bidAmount >= price)");

        // Grab a reference to the seller before the auction struct
        // gets deleted.
        let seller = auction.seller;

        // The bid is good! Remove the auction before sending the fees
        // to the sender so we can't have a reentrancy attack.
        this._removeAuction(_tokenId);

        // Transfer proceeds to seller (if there are any!)
        if (price > 0n) {
            // Calculate the auctioneer's cut.
            // (NOTE: _computeCut() is guaranteed to return a
            // value <= price, so this subtraction can't go negative.)
            let auctioneerCut = this._computeCut(price);
            let sellerProceeds = price - auctioneerCut;

            // NOTE: Doing a transfer() in the middle of a complex
            // method like this is generally discouraged because of
            // reentrancy attacks and DoS attacks if the seller is
            // a contract with an invalid fallback function. We explicitly
            // guard against reentrancy attacks by removing the auction
            // before calling transfer(), and the only thing the seller
            // can DoS is the sale of their own asset! (And if it's an
            // accident, they can call cancelAuction(). )
            // [SIMULATED: seller.transfer(sellerProceeds);]
        }

        // Calculate any excess funds included with the bid. If the excess
        // is anything worth worrying about, transfer it back to bidder.
        // NOTE: We checked above that the bid amount is greater than or
        // equal to the price so this cannot underflow.
        let bidExcess = _bidAmount - price;

        // Return the funds. Similar to the previous transfer, this is
        // not susceptible to a re-entry attack because the auction is
        // removed before any transfers occur.
        // [SIMULATED: msg.sender.transfer(bidExcess);]

        // Tell the world!
        console.log("AuctionSuccessful", _tokenId, price, msg_sender);

        return price;
    }



    /// @dev Removes an auction from the list of open auctions.
    /// @param _tokenId - ID of NFT on auction.
    _removeAuction(_tokenId) {
        delete this.tokenIdToAuction[Number(_tokenId)];
    }

    /// @dev Returns true if the NFT is on auction.
    /// @param _auction - Auction to check.
    _isOnAuction(_auction) {
        return (BigInt(_auction.startedAt) > 0n);
    }

    /// @dev Returns current price of an NFT on auction. Broken into two
    ///  functions (this one, that computes the duration from the auction
    ///  structure, and the other that does the price computation) so we
    ///  can easily test that the price computation works correctly.
    _currentPrice(_auction)
    {
        let secondsPassed = 0n;

        // A bit of insurance against negative values (or wraparound).
        // Probably not necessary (since Ethereum guarnatees that the
        // now variable doesn't ever go backwards).
        let now = BigInt(Math.floor(Date.now() / 1000));
        if (now > BigInt(_auction.startedAt)) {
            secondsPassed = now - BigInt(_auction.startedAt);
        }

        return this._computeCurrentPrice(
            BigInt(_auction.startingPrice),
            BigInt(_auction.endingPrice),
            BigInt(_auction.duration),
            secondsPassed
        );
    }

    /// @dev Computes the current price of an auction. Factored out
    ///  from _currentPrice so we can run extensive unit tests.
    ///  When testing, make this function public and turn on
    ///  `Current price computation` test suite.
    _computeCurrentPrice(
        _startingPrice,
        _endingPrice,
        _duration,
        _secondsPassed
    )
    {
        // NOTE: We don't use SafeMath (or similar) in this function because
        //  all of our public functions carefully cap the maximum values for
        //  time (at 64-bits) and currency (at 128-bits). _duration is
        //  also known to be non-zero (see the require() statement in
        //  _addAuction())
        if (_secondsPassed >= _duration) {
            // We've reached the end of the dynamic pricing portion
            // of the auction, just return the end price.
            return _endingPrice;
        } else {
            // Starting price can be higher than ending price (and often is!), so
            // this delta can be negative.
            let totalPriceChange = BigInt(_endingPrice) - BigInt(_startingPrice);

            // This multiplication can't overflow, _secondsPassed will easily fit within
            // 64-bits, and totalPriceChange will easily fit within 128-bits, their product
            // will always fit within 256-bits.
            let currentPriceChange = totalPriceChange * _secondsPassed / _duration;

            // currentPriceChange can be negative, but if so, will have a magnitude
            // less that _startingPrice. Thus, this result will always end up positive.
            let currentPrice = BigInt(_startingPrice) + currentPriceChange;

            return currentPrice;
        }
    }

    /// @dev Computes owner's cut of a sale.
    /// @param _price - Sale price of NFT.
    _computeCut(_price) {
        // NOTE: We don't use SafeMath (or similar) in this function because
        //  all of our entry functions carefully cap the maximum values for
        //  currency (at 128-bits), and ownerCut <= 10000 (see the require()
        //  statement in the ClockAuction constructor). The result of this
        //  function is always guaranteed to be <= _price.
        return _price * this.ownerCut / 10000n;
    }

}




/**
 * @title Pausable
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
class Pausable extends Ownable {
  // [SIMULATED: event Pause();]
  // [SIMULATED: event Unpause();]

  paused = false; // [SIMULATED: public paused = false;]


  /**
   * @dev modifier to allow actions only when the contract IS paused
   */
  // [SIMULATED: modifier whenNotPaused() { ... }]

  /**
   * @dev modifier to allow actions only when the contract IS NOT paused
   */
  // [SIMULATED: modifier whenPaused { ... }]

  /**
   * @dev called by the owner to pause, triggers stopped state
   */
  pause(msg_sender) {
    if (msg_sender !== this.owner) throw new Error("onlyOwner");
    if (!(this.paused === false)) throw new Error("whenNotPaused");
    this.paused = true;
    console.log("Pause");
    return true;
  }

  /**
   * @dev called by the owner to unpause, returns to normal state
   */
  unpause(msg_sender) {
    if (msg_sender !== this.owner) throw new Error("onlyOwner");
    if (!(this.paused === true)) throw new Error("whenPaused");
    this.paused = false;
    console.log("Unpause");
    return true;
  }
}


/// @title Clock auction for non-fungible tokens.
/// @notice We omit a fallback function to prevent accidental sends to this contract.
class ClockAuction extends Pausable {

    // [SIMULATED: bytes4 constant InterfaceSignature_ERC721 = bytes4(0x9a20483d);]

    /// @dev Constructor creates a reference to the NFT ownership contract
    ///  and verifies the owner cut is in the valid range.
    /// @param _nftAddress - address of a deployed contract implementing
    ///  the Nonfungible Interface.
    /// @param _cut - percent cut the owner takes on each auction, must be
    ///  between 0-10,000.
    constructor(_nftAddress, _cut) {
        super();
        if (!(_cut <= 10000n)) throw new Error("require(_cut <= 10000)");
        this.ownerCut = _cut;

        let candidateContract = _nftAddress;
        if (!(candidateContract.supportsInterface(0x9a20483d))) throw new Error("require(candidateContract.supportsInterface(InterfaceSignature_ERC721))");
        this.nonFungibleContract = candidateContract;
    }

    /// @dev Remove all Ether from the contract, which is the owner's cuts
    ///  as well as any Ether sent directly to the contract address.
    ///  Always transfers to the NFT contract, but can be called either by
    ///  the owner or the NFT contract.
    withdrawBalance(msg_sender) {
        let nftAddress = this.nonFungibleContract;

        if (!(msg_sender === this.owner || msg_sender === nftAddress)) throw new Error("require(msg.sender == owner || msg.sender == nftAddress)");
        // We are using this boolean method to make sure that even if one fails it will still work
        //
        // [SIMULATED: bool res = nftAddress.send(this.balance);]
    }

    /// @dev Creates and begins a new auction.
    /// @param _tokenId - ID of token to auction, sender must be owner.
    /// @param _startingPrice - Price of item (in wei) at beginning of auction.
    /// @param _endingPrice - Price of item (in wei) at end of auction.
    /// @param _duration - Length of time to move between starting
    ///  price and ending price (in seconds).
    /// @param _seller - Seller, if not the message sender
    createAuction(
        _tokenId,
        _startingPrice,
        _endingPrice,
        _duration,
        _seller,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        if (!(_startingPrice === BigInt(Number(BigInt.asUintN(128, _startingPrice))))) throw new Error("require(_startingPrice == uint256(uint128(_startingPrice)))");
        if (!(_endingPrice === BigInt(Number(BigInt.asUintN(128, _endingPrice))))) throw new Error("require(_endingPrice == uint256(uint128(_endingPrice)))");
        if (!(_duration === BigInt(Number(BigInt.asUintN(64, _duration))))) throw new Error("require(_duration == uint256(uint64(_duration)))");

        if (!(this._owns(msg_sender, _tokenId))) throw new Error("require(_owns(msg.sender, _tokenId))");
        this._escrow(msg_sender, _tokenId);
        let auction = {
            seller: _seller,
            startingPrice: Number(_startingPrice),
            endingPrice: Number(_endingPrice),
            duration: Number(_duration),
            startedAt: Number(BigInt(Math.floor(Date.now() / 1000))),
            isGen0: 0
        };
        this._addAuction(_tokenId, auction);
    }

    /// @dev Bids on an open auction, completing the auction and transferring
    ///  ownership of the NFT if enough Ether is supplied.
    /// @param _tokenId - ID of token to bid on.
    bid(_tokenId, msg_value)
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // _bid will throw if the bid or funds transfer fails
        this._bid(_tokenId, msg_value);
        this._transfer(msg_sender, _tokenId);
    }

    /// @dev Cancels an auction that hasn't been won yet.
    ///  Returns the NFT to original owner.
    /// @notice This is a state-modifying function that can
    ///  be called while the contract is paused.
    /// @param _tokenId - ID of token on auction
    cancelAuction(_tokenId, msg_sender)
    {
        let auction = this.tokenIdToAuction[Number(_tokenId)];
        if (!(this._isOnAuction(auction))) throw new Error("require(_isOnAuction(auction))");
        let seller = auction.seller;
        if (!(msg_sender === seller)) throw new Error("require(msg.sender == seller)");
        this._cancelAuction(_tokenId, seller);
    }

    /// @dev Cancels an auction when the contract is paused.
    ///  Only the owner may do this, and NFTs are returned to
    ///  the seller. This should only be used in emergencies.
    /// @param _tokenId - ID of the NFT on auction to cancel.
    cancelAuctionWhenPaused(_tokenId, msg_sender)
    {
        if (!(this.paused === true)) throw new Error("whenPaused");
        if (!(msg_sender === this.owner)) throw new Error("onlyOwner");
        let auction = this.tokenIdToAuction[Number(_tokenId)];
        if (!(this._isOnAuction(auction))) throw new Error("require(_isOnAuction(auction))");
        this._cancelAuction(_tokenId, auction.seller);
    }

    /// @dev Returns auction info for an NFT on auction.
    /// @param _tokenId - ID of NFT on auction.
    getAuction(_tokenId)
    {
        let auction = this.tokenIdToAuction[Number(_tokenId)];
        if (!(this._isOnAuction(auction))) throw new Error("require(_isOnAuction(auction))");
        return [
            auction.seller,
            BigInt(auction.startingPrice),
            BigInt(auction.endingPrice),
            BigInt(auction.duration),
            BigInt(auction.startedAt)
        ];
    }

    /// @dev Returns the current price of an auction.
    /// @param _tokenId - ID of the token price we are checking.
    getCurrentPrice(_tokenId)
    {
        let auction = this.tokenIdToAuction[Number(_tokenId)];
        if (!(this._isOnAuction(auction))) throw new Error("require(_isOnAuction(auction))");
        return this._currentPrice(auction);
    }

}




/// @title Reverse auction modified for siring
/// @notice We omit a fallback function to prevent accidental sends to this contract.
class SiringClockAuction extends ClockAuction {

    // @dev Sanity check that allows us to ensure that we are pointing to the
    //  right auction in our setSiringAuctionAddress() call.
    isSiringClockAuction = true; // [SIMULATED: public isSiringClockAuction = true;]

    // Delegate constructor
    constructor(_nftAddr, _cut) {
        super(_nftAddr, _cut);
    }

    /// @dev Creates and begins a new auction. Since this function is wrapped,
    /// require sender to be PandaCore contract.
    /// @param _tokenId - ID of token to auction, sender must be owner.
    /// @param _startingPrice - Price of item (in wei) at beginning of auction.
    /// @param _endingPrice - Price of item (in wei) at end of auction.
    /// @param _duration - Length of auction (in seconds).
    /// @param _seller - Seller, if not the message sender
    createAuction(
        _tokenId,
        _startingPrice,
        _endingPrice,
        _duration,
        _seller,
        msg_sender
    )
    {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        if (!(_startingPrice === BigInt(Number(BigInt.asUintN(128, _startingPrice))))) throw new Error("require(_startingPrice == uint256(uint128(_startingPrice)))");
        if (!(_endingPrice === BigInt(Number(BigInt.asUintN(128, _endingPrice))))) throw new Error("require(_endingPrice == uint256(uint128(_endingPrice)))");
        if (!(_duration === BigInt(Number(BigInt.asUintN(64, _duration))))) throw new Error("require(_duration == uint256(uint64(_duration)))");

        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require(msg.sender == address(nonFungibleContract))");
        this._escrow(_seller, _tokenId);
        let auction = {
            seller: _seller,
            startingPrice: Number(_startingPrice),
            endingPrice: Number(_endingPrice),
            duration: Number(_duration),
            startedAt: Number(BigInt(Math.floor(Date.now() / 1000))),
            isGen0: 0
        };
        this._addAuction(_tokenId, auction);
    }

    /// @dev Places a bid for siring. Requires the sender
    /// is the PandaCore contract because all bid methods
    /// should be wrapped. Also returns the panda to the
    /// seller rather than the winner.
    bid(_tokenId, msg_value, msg_sender)
    {
        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require(msg.sender == address(nonFungibleContract))");
        let seller = this.tokenIdToAuction[Number(_tokenId)].seller;
        // _bid checks that token ID is valid and will throw if bid fails
        this._bid(_tokenId, msg_value);
        // We transfer the panda back to the seller, the winner will get
        // the offspring
        this._transfer(seller, _tokenId);
    }

}




/// @title Clock auction modified for sale of pandas
/// @notice We omit a fallback function to prevent accidental sends to this contract.
class SaleClockAuction extends ClockAuction {

    // @dev Sanity check that allows us to ensure that we are pointing to the
    //  right auction in our setSaleAuctionAddress() call.
    isSaleClockAuction = true; // [SIMULATED: public isSaleClockAuction = true;]

    // Tracks last 5 sale price of gen0 panda sales
    gen0SaleCount = 0n; // [SIMULATED: public gen0SaleCount;]
    lastGen0SalePrices = [0n, 0n, 0n, 0n, 0n]; // [SIMULATED: public lastGen0SalePrices;]
    SurpriseValue = 10000000000000000n; // [SIMULATED: public constant SurpriseValue = 10 finney;]

    CommonPanda = [];
    RarePanda = [];
    CommonPandaIndex = 0n;
    RarePandaIndex = 0n;

    // Delegate constructor
    constructor(_nftAddr, _cut) {
        super(_nftAddr, _cut);
        this.CommonPandaIndex = 1n;
        this.RarePandaIndex = 1n;
    }

    /// @dev Creates and begins a new auction.
    /// @param _tokenId - ID of token to auction, sender must be owner.
    /// @param _startingPrice - Price of item (in wei) at beginning of auction.
    /// @param _endingPrice - Price of item (in wei) at end of auction.
    /// @param _duration - Length of auction (in seconds).
    /// @param _seller - Seller, if not the message sender
    createAuction(
        _tokenId,
        _startingPrice,
        _endingPrice,
        _duration,
        _seller,
        msg_sender
    )
    {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        if (!(_startingPrice === BigInt(Number(BigInt.asUintN(128, _startingPrice))))) throw new Error("require(_startingPrice == uint256(uint128(_startingPrice)))");
        if (!(_endingPrice === BigInt(Number(BigInt.asUintN(128, _endingPrice))))) throw new Error("require(_endingPrice == uint256(uint128(_endingPrice)))");
        if (!(_duration === BigInt(Number(BigInt.asUintN(64, _duration))))) throw new Error("require(_duration == uint256(uint64(_duration)))");

        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require(msg.sender == address(nonFungibleContract))");
        this._escrow(_seller, _tokenId);
        let auction = {
            seller: _seller,
            startingPrice: Number(_startingPrice),
            endingPrice: Number(_endingPrice),
            duration: Number(_duration),
            startedAt: Number(BigInt(Math.floor(Date.now() / 1000))),
            isGen0: 0
        };
        this._addAuction(_tokenId, auction);
    }

    createGen0Auction(
        _tokenId,
        _startingPrice,
        _endingPrice,
        _duration,
        _seller,
        msg_sender
    )
    {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        if (!(_startingPrice === BigInt(Number(BigInt.asUintN(128, _startingPrice))))) throw new Error("require(_startingPrice == uint256(uint128(_startingPrice)))");
        if (!(_endingPrice === BigInt(Number(BigInt.asUintN(128, _endingPrice))))) throw new Error("require(_endingPrice == uint256(uint128(_endingPrice)))");
        if (!(_duration === BigInt(Number(BigInt.asUintN(64, _duration))))) throw new Error("require(_duration == uint256(uint64(_duration)))");

        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require(msg.sender == address(nonFungibleContract))");
        this._escrow(_seller, _tokenId);
        let auction = {
            seller: _seller,
            startingPrice: Number(_startingPrice),
            endingPrice: Number(_endingPrice),
            duration: Number(_duration),
            startedAt: Number(BigInt(Math.floor(Date.now() / 1000))),
            isGen0: 1
        };
        this._addAuction(_tokenId, auction);
    }    

    /// @dev Updates lastSalePrice if seller is the nft contract
    /// Otherwise, works the same as default bid method.
    bid(_tokenId, msg_value, msg_sender)
    {
        // _bid verifies token ID size
        let isGen0 = BigInt(this.tokenIdToAuction[Number(_tokenId)].isGen0);
        let price = this._bid(_tokenId, msg_value);
        this._transfer(msg_sender, _tokenId);

        // If not a gen0 auction, exit
        if (isGen0 === 1n) {
            // Track gen0 sale prices
            this.lastGen0SalePrices[Number(this.gen0SaleCount % 5n)] = price;
            this.gen0SaleCount++;
        }
    }

    createPanda(_tokenId, _type, msg_sender)
    {
        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require(msg.sender == address(nonFungibleContract))");
        if (_type === 0n) {
            this.CommonPanda.push(_tokenId);
        }else {
            this.RarePanda.push(_tokenId);
        }
    }

    surprisePanda(msg_sender)
    {
        // [SIMULATED: keccak256(block.blockhash(block.number),block.blockhash(block.number-1))]
        let bHash = [0n]; 
        let PandaIndex;
        if (bHash[25] > 0xC8n) {
            if (!(BigInt(this.RarePanda.length) >= this.RarePandaIndex)) throw new Error("require(uint256(RarePanda.length) >= RarePandaIndex)");
            PandaIndex = this.RarePandaIndex;
            this.RarePandaIndex++;

        } else{
            if (!(BigInt(this.CommonPanda.length) >= this.CommonPandaIndex)) throw new Error("require(uint256(CommonPanda.length) >= CommonPandaIndex)");
            PandaIndex = this.CommonPandaIndex;
            this.CommonPandaIndex++;
        }
        this._transfer(msg_sender, PandaIndex);
    }

    packageCount() {
        let common = BigInt(this.CommonPanda.length) + 1n - this.CommonPandaIndex;
        let surprise = BigInt(this.RarePanda.length) + 1n - this.RarePandaIndex;
        return [common, surprise];
    }

    averageGen0SalePrice() {
        let sum = 0n;
        for (let i = 0n; i < 5n; i++) {
            sum += this.lastGen0SalePrices[Number(i)];
        }
        return sum / 5n;
    }

}



/// @title Clock auction modified for sale of pandas
/// @notice We omit a fallback function to prevent accidental sends to this contract.
class SaleClockAuctionERC20 extends ClockAuction {


    // [SIMULATED: event AuctionERC20Created(uint256 tokenId, uint256 startingPrice, uint256 endingPrice, uint256 duration, address erc20Contract);]

    // @dev Sanity check that allows us to ensure that we are pointing to the
    //  right auction in our setSaleAuctionAddress() call.
    isSaleClockAuctionERC20 = true; // [SIMULATED: public isSaleClockAuctionERC20 = true;]

    tokenIdToErc20Address = {}; // [SIMULATED: mapping (uint256 => address) public tokenIdToErc20Address;]

    erc20ContractsSwitcher = {}; // [SIMULATED: mapping (address => uint256) public erc20ContractsSwitcher;]

    balances = {}; // [SIMULATED: mapping (address => uint256) public balances;]
    
    // Delegate constructor
    constructor(_nftAddr, _cut) {
        super(_nftAddr, _cut);
    }

    erc20ContractSwitch(_erc20address, _onoff, msg_sender) {
        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require (msg.sender == address(nonFungibleContract))");

        if (!(_erc20address !== "0x0000000000000000000000000000000000000000")) throw new Error("require (_erc20address != address(0))");

        this.erc20ContractsSwitcher[_erc20address] = _onoff;
    }
    /// @dev Creates and begins a new auction.
    /// @param _tokenId - ID of token to auction, sender must be owner.
    /// @param _startingPrice - Price of item (in wei) at beginning of auction.
    /// @param _endingPrice - Price of item (in wei) at end of auction.
    /// @param _duration - Length of auction (in seconds).
    /// @param _seller - Seller, if not the message sender
    createAuction(
        _tokenId,
        _erc20Address,
        _startingPrice,
        _endingPrice,
        _duration,
        _seller,
        msg_sender
    )
    {
        // Sanity check that no inputs overflow how many bits we've allocated
        // to store them in the auction struct.
        if (!(_startingPrice === BigInt(Number(BigInt.asUintN(128, _startingPrice))))) throw new Error("require(_startingPrice == uint256(uint128(_startingPrice)))");
        if (!(_endingPrice === BigInt(Number(BigInt.asUintN(128, _endingPrice))))) throw new Error("require(_endingPrice == uint256(uint128(_endingPrice)))");
        if (!(_duration === BigInt(Number(BigInt.asUintN(64, _duration))))) throw new Error("require(_duration == uint256(uint64(_duration)))");

        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require(msg.sender == address(nonFungibleContract))");

        if (!(this.erc20ContractsSwitcher[_erc20Address] > 0n)) throw new Error("require (erc20ContractsSwitcher[_erc20Address] > 0)");
        
        this._escrow(_seller, _tokenId);
        let auction = {
            seller: _seller,
            startingPrice: Number(_startingPrice),
            endingPrice: Number(_endingPrice),
            duration: Number(_duration),
            startedAt: Number(BigInt(Math.floor(Date.now() / 1000))),
            isGen0: 0
        };
        this._addAuctionERC20(_tokenId, auction, _erc20Address);
        this.tokenIdToErc20Address[Number(_tokenId)] = _erc20Address;
    }

    /// @dev Adds an auction to the list of open auctions. Also fires the
    ///  AuctionCreated event.
    /// @param _tokenId The ID of the token to be put on auction.
    /// @param _auction Auction to add.
    _addAuctionERC20(_tokenId, _auction, _erc20address) {
        // Require that all auctions have a duration of
        // at least one minute. (Keeps our math from getting hairy!)
        if (!(_auction.duration >= 60n)) throw new Error("require(_auction.duration >= 1 minutes)");

        this.tokenIdToAuction[Number(_tokenId)] = _auction;

        console.log("AuctionERC20Created", _tokenId, BigInt(_auction.startingPrice), BigInt(_auction.endingPrice), BigInt(_auction.duration), _erc20address);
    }   

    bid(_tokenId) {
            // do nothing
    }

    /// @dev Updates lastSalePrice if seller is the nft contract
    /// Otherwise, works the same as default bid method.
    bidERC20(_tokenId, _amount, msg_sender)
    {
        // _bid verifies token ID size
        let seller = this.tokenIdToAuction[Number(_tokenId)].seller;
        let _erc20address = this.tokenIdToErc20Address[Number(_tokenId)];
        if (!(_erc20address !== "0x0000000000000000000000000000000000000000")) throw new Error("require (_erc20address != address(0))");
        let price = this._bidERC20(_erc20address, msg_sender, _tokenId, _amount);
        this._transfer(msg_sender, _tokenId);
        delete this.tokenIdToErc20Address[Number(_tokenId)];
    }

    cancelAuction(_tokenId, msg_sender)
    {
        let auction = this.tokenIdToAuction[Number(_tokenId)];
        if (!(this._isOnAuction(auction))) throw new Error("require(_isOnAuction(auction))");
        let seller = auction.seller;
        if (!(msg_sender === seller)) throw new Error("require(msg.sender == seller)");
        this._cancelAuction(_tokenId, seller);
        delete this.tokenIdToErc20Address[Number(_tokenId)];
    }

    withdrawERC20Balance(_erc20Address, _to, msg_sender) {
        if (!(this.balances[_erc20Address] > 0n)) throw new Error("require (balances[_erc20Address] > 0)");
        if (!(msg_sender === this.nonFungibleContract)) throw new Error("require(msg.sender == address(nonFungibleContract))");
        // [SIMULATED: ERC20(_erc20Address).transfer(_to, balances[_erc20Address]);]
    }
    
    /// @dev Computes the price and transfers winnings.
    /// Does NOT transfer ownership of token.
    _bidERC20(_erc20Address, _buyerAddress, _tokenId, _bidAmount)
    {
        // Get a reference to the auction struct
        let auction = this.tokenIdToAuction[Number(_tokenId)];

        // Explicitly check that this auction is currently live.
        // (Because of how Ethereum mappings work, we can't just count
        // on the lookup above failing. An invalid _tokenId will just
        // return an auction object that is all zeros.)
        if (!(this._isOnAuction(auction))) throw new Error("require(_isOnAuction(auction))");


        if (!(_erc20Address !== "0x0000000000000000000000000000000000000000" && _erc20Address === this.tokenIdToErc20Address[Number(_tokenId)])) throw new Error("require (_erc20Address != address(0) && _erc20Address == tokenIdToErc20Address[_tokenId])");
        

        // Check that the bid is greater than or equal to the current price
        let price = this._currentPrice(auction);
        if (!(_bidAmount >= price)) throw new Error("require(_bidAmount >= price)");

        // Grab a reference to the seller before the auction struct
        // gets deleted.
        let seller = auction.seller;

        // The bid is good! Remove the auction before sending the fees
        // to the sender so we can't have a reentrancy attack.
        this._removeAuction(_tokenId);

        // Transfer proceeds to seller (if there are any!)
        if (price > 0n) {
            // Calculate the auctioneer's cut.
            // (NOTE: _computeCut() is guaranteed to return a
            // value <= price, so this subtraction can't go negative.)
            let auctioneerCut = this._computeCut(price);
            let sellerProceeds = price - auctioneerCut;

            // Send Erc20 Token to seller should call Erc20 contract
            // Reference to contract
            // [SIMULATED: require(ERC20(_erc20Address).transferFrom(_buyerAddress,seller,sellerProceeds));]
            if (auctioneerCut > 0n){
                // [SIMULATED: require(ERC20(_erc20Address).transferFrom(_buyerAddress,address(this),auctioneerCut));]
                this.balances[_erc20Address] = (this.balances[_erc20Address] || 0n) + auctioneerCut;
            }
        }

        // Tell the world!
        console.log("AuctionSuccessful", _tokenId, price, _buyerAddress);

        return price;
    }
}


/// @title Handles creating auctions for sale and siring of pandas.
///  This wrapper of ReverseAuction exists only so that users can create
///  auctions with only one transaction.
class PandaAuction extends PandaBreeding {

    // @notice The auction contract variables are defined in PandaBase to allow
    //  us to refer to them in PandaOwnership to prevent accidental transfers.
    // `saleAuction` refers to the auction for gen0 and p2p sale of pandas.
    // `siringAuction` refers to the auction for siring rights of pandas.

    /// @dev Sets the reference to the sale auction.
    /// @param _address - Address of sale contract.
    setSaleAuctionAddress(_address, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        let candidateContract = _address;

        // NOTE: verify that a contract is what we expect - https://github.com/Lunyr/crowdsale-contracts/blob/cfadd15986c30521d8ba7d5b6f57b4fefcc7ac38/contracts/LunyrToken.sol#L117
        if (!(candidateContract.isSaleClockAuction())) throw new Error("require(candidateContract.isSaleClockAuction())");

        // Set the new contract address
        this.saleAuction = candidateContract;
    }

    setSaleAuctionERC20Address(_address, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        let candidateContract = _address;

        // NOTE: verify that a contract is what we expect - https://github.com/Lunyr/crowdsale-contracts/blob/cfadd15986c30521d8ba7d5b6f57b4fefcc7ac38/contracts/LunyrToken.sol#L117
        if (!(candidateContract.isSaleClockAuctionERC20())) throw new Error("require(candidateContract.isSaleClockAuctionERC20())");

        // Set the new contract address
        this.saleAuctionERC20 = candidateContract;
    }

    /// @dev Sets the reference to the siring auction.
    /// @param _address - Address of siring contract.
    setSiringAuctionAddress(_address, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        let candidateContract = _address;

        // NOTE: verify that a contract is what we expect - https://github.com/Lunyr/crowdsale-contracts/blob/cfadd15986c30521d8ba7d5b6f57b4fefcc7ac38/contracts/LunyrToken.sol#L117
        if (!(candidateContract.isSiringClockAuction())) throw new Error("require(candidateContract.isSiringClockAuction())");

        // Set the new contract address
        this.siringAuction = candidateContract;
    }

    /// @dev Put a panda up for auction.
    ///  Does some ownership trickery to create auctions in one tx.
    createSaleAuction(
        _pandaId,
        _startingPrice,
        _endingPrice,
        _duration,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Auction contract checks input sizes
        // If panda is already on any auction, this will throw
        // because it will be owned by the auction contract.
        if (!(this._owns(msg_sender, _pandaId))) throw new Error("require(_owns(msg.sender, _pandaId))");
        // Ensure the panda is not pregnant to prevent the auction
        // contract accidentally receiving ownership of the child.
        // NOTE: the panda IS allowed to be in a cooldown.
        if (!(this.isPregnant(_pandaId) === false)) throw new Error("require(!isPregnant(_pandaId))");
        this._approve(_pandaId, this.saleAuction);
        // Sale auction throws if inputs are invalid and clears
        // transfer and sire approval after escrowing the panda.
        this.saleAuction.createAuction(
            _pandaId,
            _startingPrice,
            _endingPrice,
            _duration,
            msg_sender
        );
    }

    /// @dev Put a panda up for auction.
    ///  Does some ownership trickery to create auctions in one tx.
    createSaleAuctionERC20(
        _pandaId,
        _erc20address,
        _startingPrice,
        _endingPrice,
        _duration,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Auction contract checks input sizes
        // If panda is already on any auction, this will throw
        // because it will be owned by the auction contract.
        if (!(this._owns(msg_sender, _pandaId))) throw new Error("require(_owns(msg.sender, _pandaId))");
        // Ensure the panda is not pregnant to prevent the auction
        // contract accidentally receiving ownership of the child.
        // NOTE: the panda IS allowed to be in a cooldown.
        if (!(this.isPregnant(_pandaId) === false)) throw new Error("require(!isPregnant(_pandaId))");
        this._approve(_pandaId, this.saleAuctionERC20);
        // Sale auction throws if inputs are invalid and clears
        // transfer and sire approval after escrowing the panda.
        this.saleAuctionERC20.createAuction(
            _pandaId,
            _erc20address,
            _startingPrice,
            _endingPrice,
            _duration,
            msg_sender
        );
    }

    switchSaleAuctionERC20For(_erc20address, _onoff, msg_sender) {
        if (msg_sender !== this.cooAddress) throw new Error("onlyCOO");
        this.saleAuctionERC20.erc20ContractSwitch(_erc20address, _onoff);
    }


    /// @dev Put a panda up for auction to be sire.
    ///  Performs checks to ensure the panda can be sired, then
    ///  delegates to reverse auction.
    createSiringAuction(
        _pandaId,
        _startingPrice,
        _endingPrice,
        _duration,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Auction contract checks input sizes
        // If panda is already on any auction, this will throw
        // because it will be owned by the auction contract.
        if (!(this._owns(msg_sender, _pandaId))) throw new Error("require(_owns(msg.sender, _pandaId))");
        if (!(this.isReadyToBreed(_pandaId))) throw new Error("require(isReadyToBreed(_pandaId))");
        this._approve(_pandaId, this.siringAuction);
        // Siring auction throws if inputs are invalid and clears
        // transfer and sire approval after escrowing the panda.
        this.siringAuction.createAuction(
            _pandaId,
            _startingPrice,
            _endingPrice,
            _duration,
            msg_sender
        );
    }

    /// @dev Completes a siring auction by bidding.
    ///  Immediately breeds the winning matron with the sire on auction.
    /// @param _sireId - ID of the sire on auction.
    /// @param _matronId - ID of the matron owned by the bidder.
    bidOnSiringAuction(
        _sireId,
        _matronId,
        msg_value,
        msg_sender
    )
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        // Auction contract checks input sizes
        if (!(this._owns(msg_sender, _matronId))) throw new Error("require(_owns(msg.sender, _matronId))");
        if (!(this.isReadyToBreed(_matronId))) throw new Error("require(isReadyToBreed(_matronId))");
        if (!(this._canBreedWithViaAuction(_matronId, _sireId))) throw new Error("require(_canBreedWithViaAuction(_matronId, _sireId))");

        // Define the current price of the auction.
        let currentPrice = this.siringAuction.getCurrentPrice(_sireId);
        if (!(msg_value >= currentPrice + this.autoBirthFee)) throw new Error("require(msg.value >= currentPrice + autoBirthFee)");

        // Siring auction will throw if the bid fails.
        // [SIMULATED: siringAuction.bid.value(msg.value - autoBirthFee)(_sireId);]
        this._breedWith(Number(_matronId), Number(_sireId), msg_sender);
    }

    /// @dev Transfers the balance of the sale auction contract
    /// to the PandaCore contract. We use two-step withdrawal to
    /// prevent two transfer calls in the auction bid function.
    withdrawAuctionBalances(msg_sender) {
        if (!(msg_sender === this.cooAddress || msg_sender === this.ceoAddress || msg_sender === this.cfoAddress)) throw new Error("onlyCLevel");
        this.saleAuction.withdrawBalance();
        this.siringAuction.withdrawBalance();
    }


    withdrawERC20Balance(_erc20Address, _to, msg_sender) {
        if (!(msg_sender === this.cooAddress || msg_sender === this.ceoAddress || msg_sender === this.cfoAddress)) throw new Error("onlyCLevel");
        if (!(this.saleAuctionERC20 !== "0x0000000000000000000000000000000000000000")) throw new Error("require(saleAuctionERC20 != address(0))");
        this.saleAuctionERC20.withdrawERC20Balance(_erc20Address, _to);
    }    
}





/// @title all functions related to creating kittens
class PandaMinting extends PandaAuction {

    // Limits the number of cats the contract owner can ever create.
    //uint256 public constant PROMO_CREATION_LIMIT = 5000;
    GEN0_CREATION_LIMIT = 45000n; // [SIMULATED: public constant GEN0_CREATION_LIMIT = 45000;]


    // Constants for gen0 auctions.
    GEN0_STARTING_PRICE = 100000000000000000n; // [SIMULATED: public constant GEN0_STARTING_PRICE = 100 finney;]
    GEN0_AUCTION_DURATION = 86400n; // [SIMULATED: public constant GEN0_AUCTION_DURATION = 1 days;]
    OPEN_PACKAGE_PRICE = 10000000000000000n; // [SIMULATED: public constant OPEN_PACKAGE_PRICE = 10 finney;]


    // Counts the number of cats the contract owner has created.
    //uint256 public promoCreatedCount;


    /// @dev we can create promo kittens, up to a limit. Only callable by COO
    /// @param _genes the encoded genes of the kitten to be created, any value is accepted
    /// @param _owner the future owner of the created kittens. Default to contract COO
    createWizzPanda(_genes, _generation, _owner, msg_sender) {
        if (msg_sender !== this.cooAddress) throw new Error("onlyCOO");
        let pandaOwner = _owner;
        if (pandaOwner === "0x0000000000000000000000000000000000000000") {
            pandaOwner = this.cooAddress;
        }

        this._createPanda(0n, 0n, _generation, _genes, pandaOwner);
    }

    /// @dev create pandaWithGenes
    /// @param _genes panda genes
    /// @param _type  0 common 1 rare
    createPanda(_genes, _generation, _type, msg_value, msg_sender)
    {
        if (this.paused === true) throw new Error("whenNotPaused");
        if (msg_sender !== this.cooAddress) throw new Error("onlyCOO");
        if (!(msg_value >= this.OPEN_PACKAGE_PRICE)) throw new Error("require(msg.value >= OPEN_PACKAGE_PRICE)");
        let kittenId = this._createPanda(0n, 0n, _generation, _genes, this.saleAuction);
        this.saleAuction.createPanda(kittenId, _type);
    }

    //function buyPandaERC20(address _erc20Address, address _buyerAddress, uint256 _pandaID, uint256 _amount)
    //external
    //onlyCOO
    //whenNotPaused {
    //    saleAuctionERC20.bid(_erc20Address, _buyerAddress, _pandaID, _amount);
    //}

    /// @dev Creates a new gen0 panda with the given genes and
    ///  creates an auction for it.
    //function createGen0Auction(uint256[2] _genes) external onlyCOO {
    //    require(gen0CreatedCount < GEN0_CREATION_LIMIT);
    //
    //    uint256 pandaId = _createPanda(0, 0, 0, _genes, address(this));
    //    _approve(pandaId, saleAuction);
    //
    //    saleAuction.createAuction(
    //        pandaId,
    //        _computeNextGen0Price(),
    //        0,
    //        GEN0_AUCTION_DURATION,
    //        address(this)
    //    );
    //
    //    gen0CreatedCount++;
    //}

    createGen0Auction(_pandaId, msg_sender) {
        if (msg_sender !== this.cooAddress) throw new Error("onlyCOO");
        if (!(this._owns(msg_sender, _pandaId))) throw new Error("require(_owns(msg.sender, _pandaId))");
        //require(pandas[_pandaId].generation==1);

        this._approve(_pandaId, this.saleAuction);

        this.saleAuction.createGen0Auction(
            _pandaId,
            this._computeNextGen0Price(),
            0n,
            this.GEN0_AUCTION_DURATION,
            msg_sender
        );
    }

    /// @dev Computes the next gen0 auction starting price, given
    ///  the average of the past 5 prices + 50%.
    _computeNextGen0Price() {
        let avePrice = this.saleAuction.averageGen0SalePrice();

        // Sanity check to ensure we don't overflow arithmetic
        if (!(avePrice === BigInt(Number(BigInt.asUintN(128, avePrice))))) throw new Error("require(avePrice == uint256(uint128(avePrice)))");

        let nextPrice = avePrice + (avePrice / 2n);

        // We never auction for less than starting price
        if (nextPrice < this.GEN0_STARTING_PRICE) {
            nextPrice = this.GEN0_STARTING_PRICE;
        }

        return nextPrice;
    }
}



/// @title CryptoPandas: Collectible, breedable, and oh-so-adorable cats on the Ethereum blockchain.
/// @author Axiom Zen (https://www.axiomzen.co)
/// @dev The main CryptoPandas contract, keeps track of kittens so they don't wander around and get lost.
class PandaCore extends PandaMinting {

    // This is the main CryptoPandas contract. In order to keep our code seperated into logical sections,
    // we've broken it up in two ways. First, we have several seperately-instantiated sibling contracts
    // that handle auctions and our super-top-secret genetic combination algorithm. The auctions are
    // seperate since their logic is somewhat complex and there's always a risk of subtle bugs. By keeping
    // them in their own contracts, we can upgrade them without disrupting the main contract that tracks
    // panda ownership. The genetic combination algorithm is kept seperate so we can open-source all of
    // the rest of our code without making it _too_ easy for folks to figure out how the genetics work.
    // Don't worry, I'm sure someone will reverse engineer it soon enough!
    //
    // Secondly, we break the core contract into multiple files using inheritence, one for each major
    // facet of functionality of CK. This allows us to keep related code bundled together while still
    // avoiding a single giant file with everything in it. The breakdown is as follows:
    //
    //      - PandaBase: This is where we define the most fundamental code shared throughout the core
    //             functionality. This includes our main data storage, constants and data types, plus
    //             internal functions for managing these items.
    //
    //      - PandaAccessControl: This contract manages the various addresses and constraints for operations
    //             that can be executed only by specific roles. Namely CEO, CFO and COO.
    //
    //      - PandaOwnership: This provides the methods required for basic non-fungible token
    //             transactions, following the draft ERC-721 spec (https://github.com/ethereum/EIPs/issues/721).
    //
    //      - PandaBreeding: This file contains the methods necessary to breed cats together, including
    //             keeping track of siring offers, and relies on an external genetic combination contract.
    //
    //      - PandaAuctions: Here we have the public methods for auctioning or bidding on cats or siring
    //             services. The actual auction functionality is handled in two sibling contracts (one
    //             for sales and one for siring), while auction creation and bidding is mostly mediated
    //             through this facet of the core contract.
    //
    //      - PandaMinting: This final facet contains the functionality we use for creating new gen0 cats.
    //             the community is new), and all others can only be created and then immediately put up
    //             for auction via an algorithmically determined starting price. Regardless of how they
    //             are created, there is a hard limit of 50k gen0 cats. After that, it's all up to the
    //             community to breed, breed, breed!

    // Set in case the core contract is broken and an upgrade is required
    newContractAddress = null; // [SIMULATED: public newContractAddress;]


    /// @notice Creates the main CryptoPandas smart contract instance.
    constructor(msg_sender) {
        super();
        // Starts paused.
        this.paused = true;

        // the creator of the contract is the initial CEO
        this.ceoAddress = msg_sender;

        // the creator of the contract is also the initial COO
        this.cooAddress = msg_sender;

        // move these code to init(), so we not excceed gas limit
        //uint256[2] memory _genes = [uint256(-1),uint256(-1)];

        //wizzPandaQuota[1] = 100;

        //_createPanda(0, 0, 0, _genes, address(0));
    }

    /// init contract
    init(msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        if (!(this.paused === true)) throw new Error("whenPaused");
        // make sure init() only run once
        if (!(this.pandas.length === 0)) throw new Error("require(pandas.length == 0)");
        // start with the mythical kitten 0 - so we don't have generation-0 parent issues
        let _genes = [BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"), BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")];

        this.wizzPandaQuota[1] = 100n;
       this._createPanda(0n, 0n, 0n, _genes, "0x0000000000000000000000000000000000000000");
    }

    /// @dev Used to mark the smart contract as upgraded, in case there is a serious
    ///  breaking bug. This method does nothing but keep track of the new contract and
    ///  emit a message indicating that the new address is set. It's up to clients of this
    ///  contract to update to the new contract address in that case. (This contract will
    ///  be paused indefinitely if such an upgrade takes place.)
    /// @param _v2Address new address
    setNewAddress(_v2Address, msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        if (!(this.paused === true)) throw new Error("whenPaused");
        // See README.md for updgrade plan
        this.newContractAddress = _v2Address;
        console.log("ContractUpgrade", _v2Address);
    }
    

    /// @notice No tipping!
    /// @dev Reject all Ether from being sent here, unless it's from one of the
    ///  two auction contracts. (Hopefully, we can prevent user accidents.)
    fallback(msg_sender) {
        if (!(msg_sender === this.saleAuction || msg_sender === this.siringAuction)) throw new Error("require(msg.sender == address(saleAuction) || msg.sender == address(siringAuction))");
    }

    /// @notice Returns all the relevant information about a specific panda.
    /// @param _id The ID of the panda of interest.
    getPanda(_id)
    {
        let kit = this.pandas[Number(_id)];

        // if this variable is 0 then it's not gestating
        let isGestating = (kit.siringWithId !== 0);
        let isReady = (BigInt(kit.cooldownEndBlock) <= BigInt(0)); // [SIMULATED: block.number]
        let cooldownIndex = BigInt(kit.cooldownIndex);
        let nextActionAt = BigInt(kit.cooldownEndBlock);
        let siringWithId = BigInt(kit.siringWithId);
        let birthTime = BigInt(kit.birthTime);
        let matronId = BigInt(kit.matronId);
        let sireId = BigInt(kit.sireId);
        let generation = BigInt(kit.generation);
        let genes = kit.genes;
        return [isGestating, isReady, cooldownIndex, nextActionAt, siringWithId, birthTime, matronId, sireId, generation, genes];
    }

    /// @dev Override unpause so it requires all external contract addresses
    ///  to be set before contract can be unpaused. Also, we can't have
    ///  newContractAddress set either, because then the contract was upgraded.
    /// @notice This is public rather than external so we can call super.unpause
    ///  without using an expensive CALL.
    unpause(msg_sender) {
        if (msg_sender !== this.ceoAddress) throw new Error("onlyCEO");
        if (!(this.paused === true)) throw new Error("whenPaused");
        if (!(this.saleAuction !== null)) throw new Error("require(saleAuction != address(0))");
        if (!(this.siringAuction !== null)) throw new Error("require(siringAuction != address(0))");
        if (!(this.geneScience !== null)) throw new Error("require(geneScience != address(0))");
        if (!(this.newContractAddress === null)) throw new Error("require(newContractAddress == address(0))");

        // Actually unpause the contract.
        super.unpause(msg_sender);
    }

    // @dev Allows the CFO to capture the balance available to the contract.
    withdrawBalance(msg_sender) {
        if (msg_sender !== this.cfoAddress) throw new Error("onlyCFO");
        let balance = 0n; // [SIMULATED: this.balance]
        // Subtract all the currently pregnant kittens we have, plus 1 of margin.
        let subtractFees = (this.pregnantPandas + 1n) * this.autoBirthFee;

        if (balance > subtractFees) {
             //
            // [SIMULATED: cfoAddress.send(balance - subtractFees);]
        }
    }
}