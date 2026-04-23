/*



 */

class Unprotected {
    owner;

    constructor(msg_sender) {
        this.owner = msg_sender;
    }

    // This function should be protected
    //
    changeOwner(msg_sender, _newOwner) {
        this.owner = _newOwner;
    }

    /*
    function changeOwner_fixed(address _newOwner)
         public
         onlyowner
     {
        owner = _newOwner;
     }
     */
}