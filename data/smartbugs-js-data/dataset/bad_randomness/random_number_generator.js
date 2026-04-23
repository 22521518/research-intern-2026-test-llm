/*



 */

// Based on TheRun contract deployed at 0xcac337492149bDB66b088bf5914beDfBf78cCC18.
class RandomNumberGenerator {
  constructor(block_timestamp, block_number) {
    //
    this.salt = BigInt(block_timestamp);
    this.block_number = BigInt(block_number); // [SIMULATED: block.number]
  }

  random(max, block_timestamp, block_number) {
    // Get the best seed for randomness
    let x = this.salt * 100n / max;
    //
    let y = this.salt * block_number / (this.salt % 5n);
    //
    let seed = block_number / 3n + (this.salt % 300n) + y;
    //
    let h = BigInt(blockhash(Number(seed))); // [SIMULATED: blockhash]
    // Random number between 1 and max
    return (h / x) % max + 1n;
  }
}