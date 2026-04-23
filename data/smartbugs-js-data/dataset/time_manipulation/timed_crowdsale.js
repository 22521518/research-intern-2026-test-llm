/*



 */

// [SIMULATED: pragma solidity ^0.4.25;]

class TimedCrowdsale {
  // Sale should finish exactly at January 1, 2019
  isSaleFinished(block) { // [SIMULATED: view public returns (bool)]
    //
    return BigInt(block.timestamp) >= 1546300800n;
  }
}