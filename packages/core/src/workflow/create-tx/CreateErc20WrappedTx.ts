import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { BigNumber } from 'bignumber.js';
import { TxTarget } from './types';

export interface Erc20WrappedDetails {
  address?: string;
  amount?: BigAmount | Wei;
  gas?: BigNumber;
  gasPrice?: Wei;
  target?: TxTarget;
  totalBalance?: Wei;
  totalTokenBalance?: BigAmount;
}

export class CreateErc20WrappedTx {
  public address?: string;
  public amount: BigAmount | Wei;
  public target: TxTarget;
  public gas: BigNumber;
  public gasPrice: Wei;
  public totalBalance: Wei;
  public totalTokenBalance?: BigAmount;

  constructor(details: Erc20WrappedDetails) {
    this.address = details.address;
    this.amount = details.amount ?? Wei.ZERO;
    this.target = details.target ?? TxTarget.MANUAL;
    this.gas = details.gas ?? new BigNumber(50000);
    this.gasPrice = details.gasPrice ?? Wei.ZERO;
    this.totalBalance = details.totalBalance ?? Wei.ZERO;
    this.totalTokenBalance = details.totalTokenBalance;
  }

  public static fromPlain(details: Erc20WrappedDetails): CreateErc20WrappedTx {
    return new CreateErc20WrappedTx(details);
  }

  public dump(): Erc20WrappedDetails {
    return {
      address: this.address,
      amount: this.amount,
      gas: this.gas,
      gasPrice: this.gasPrice,
      target: this.target,
      totalBalance: this.totalBalance,
      totalTokenBalance: this.totalTokenBalance,
    }
  }

  public getFees(): Wei {
    return this.gasPrice.multiply(this.gas);
  }

  public rebalance(): void {
    if (this.target === TxTarget.SEND_ALL) {
      if (Wei.is(this.amount)) {
        const amount = this.totalBalance.minus(this.getFees());

        if (amount.isZero() || amount.isPositive()) {
          this.amount = amount;
        }
      } else if (this.totalTokenBalance != null) {
        this.amount = this.totalTokenBalance;
      }
    }
  }
}
