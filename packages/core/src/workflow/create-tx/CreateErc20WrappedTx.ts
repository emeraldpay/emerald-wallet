import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { BigNumber } from 'bignumber.js';
import { TxTarget } from './types';

export interface Erc20WrappedDetails {
  address?: string;
  amount?: BigAmount | Wei;
  gas?: BigNumber;
  gasPrice?: Wei;
  maxGasPrice?: Wei;
  priorityGasPrice?: Wei;
  target?: TxTarget;
  totalBalance?: Wei;
  totalTokenBalance?: BigAmount;
}

export class CreateErc20WrappedTx {
  public address?: string;
  public amount: BigAmount | Wei;
  public target: TxTarget;
  public gas: BigNumber;
  public gasPrice?: Wei;
  public maxGasPrice?: Wei;
  public priorityGasPrice?: Wei;
  public totalBalance: Wei;
  public totalTokenBalance?: BigAmount;

  constructor(details: Erc20WrappedDetails, eip1559 = false) {
    this.address = details.address;
    this.amount = details.amount ?? Wei.ZERO;
    this.target = details.target ?? TxTarget.MANUAL;
    this.gas = details.gas ?? new BigNumber(50000);
    this.totalBalance = details.totalBalance ?? Wei.ZERO;
    this.totalTokenBalance = details.totalTokenBalance;

    if (eip1559 || details.maxGasPrice != null) {
      this.maxGasPrice = details.maxGasPrice ?? Wei.ZERO;
      this.priorityGasPrice = details.priorityGasPrice ?? Wei.ZERO;
    } else {
      this.gasPrice = details.gasPrice ?? Wei.ZERO;
    }
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
      maxGasPrice: this.maxGasPrice,
      priorityGasPrice: this.priorityGasPrice,
      target: this.target,
      totalBalance: this.totalBalance,
      totalTokenBalance: this.totalTokenBalance,
    };
  }

  public getFees(): Wei {
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? Wei.ZERO;

    return gasPrice.multiply(this.gas);
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
