/*



 */

 // [SIMULATED: pragma solidity ^0.4.15;]

 class Overflow {
     constructor() {
         this.sellerBalance = 0n;
     }

     add(value) {
         //
         this.sellerBalance += value; // possible overflow

         // possible auditor assert
         // assert(sellerBalance >= value);
     }

  // function safe_add(uint value) returns (bool){
  //   require(value + sellerBalance >= sellerBalance);
  // sellerBalance += value;
  // } 
 }