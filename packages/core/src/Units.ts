import BigNumber from 'bignumber.js';

export interface IUnits {
  amount: string;
  decimals: number;
}

/**
 * Type for every currency base units
 * Ethereum - wei
 * Bitcoin - satoshi
 */
class Units implements IUnits {
  public amount: string;
  public decimals: number;

  constructor (amount: string, decimals: number) {
    const bAmount = new BigNumber(amount);
    if (bAmount.isNaN()) {
      throw new Error('Invalid value of amount: ' + amount);
    }
    this.amount = bAmount.toString(10);
    this.decimals = decimals;
  }
}

export default Units;
