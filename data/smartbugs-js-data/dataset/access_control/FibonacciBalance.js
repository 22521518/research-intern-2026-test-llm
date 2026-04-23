/*



 */

//added pragma version
// [SIMULATED: pragma solidity ^0.4.22;]

class FibonacciBalance {
    constructor(_fibonacciLibrary) {
        this.fibonacciLibrary = _fibonacciLibrary;
        // the current fibonacci number to withdraw
        this.calculatedFibNumber = 0n;
        // the starting fibonacci sequence number
        this.start = 3n;
        this.withdrawalCounter = 0n;
        // the fibonancci function selector
        this.fibSig = 0x00000000n; // [SIMULATED: bytes4 constant fibSig = bytes4(sha3("setFibonacci(uint256)"));]
    }

    // constructor - loads the contract with ether
    // [SIMULATED: constructor(address _fibonacciLibrary) public payable]
    
    withdraw(msg_sender, msg_value) {
        this.withdrawalCounter += 1n;
        // calculate the fibonacci number for the current withdrawal user
        // this sets calculatedFibNumber
        //
        if (!this.fibonacciLibrary.delegatecall(this.fibSig, this.withdrawalCounter)) throw new Error("");
        // [SIMULATED: msg.sender.transfer(calculatedFibNumber * 1 ether);]
    }

    // allow users to call fibonacci library functions
    // [SIMULATED: function() public]
    fallback(msg_data) {
        //
        if (!this.fibonacciLibrary.delegatecall(msg_data)) throw new Error("");
    }
}

// library contract - calculates fibonacci-like numbers;
class FibonacciLib {
    constructor() {
        // initializing the standard fibonacci sequence;
        this.start = 0n;
        this.calculatedFibNumber = 0n;
    }

    // modify the zeroth number in the sequence
    setStart(_start) {
        this.start = _start;
    }

    setFibonacci(n) {
        this.calculatedFibNumber = this.fibonacci(n);
    }

    fibonacci(n) {
        if (n == 0n) return this.start;
        else if (n == 1n) return this.start + 1n;
        else return this.fibonacci(n - 1n) + this.fibonacci(n - 2n);
    }
}