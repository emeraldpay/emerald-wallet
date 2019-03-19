import BigNumber from 'bignumber.js';

/**
 * Type for every currency base units
 * Ethereum - wei
 * Bitcoin - satoshi
 */
class Units {
  amount: string;
  decimals: number;

  constructor(amount: string, decimals: number) {
    const bAmount = new BigNumber(amount);
    if (bAmount.isNaN()) {
      throw new Error('Invalid value of amount: ' + amount);
    }
    this.amount = bAmount.toString(10);
    this.decimals = decimals;
  }
}

export default Units;