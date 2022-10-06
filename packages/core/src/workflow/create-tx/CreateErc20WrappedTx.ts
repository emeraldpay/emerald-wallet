import { BigAmount } from '@emeraldpay/bigamount';
import { TxTarget } from './types';
import { BlockchainCode, amountFactory } from '../../blockchains';

export interface Erc20WrappedDetails {
  address?: string;
  blockchain: BlockchainCode;
  amount?: BigAmount;
  gas?: number;
  gasPrice?: BigAmount;
  maxGasPrice?: BigAmount;
  priorityGasPrice?: BigAmount;
  target?: TxTarget;
  totalBalance?: BigAmount;
  totalTokenBalance?: BigAmount;
}

export class CreateErc20WrappedTx {
  public address?: string;
  public blockchain: BlockchainCode;
  public amount: BigAmount;
  public target: TxTarget;
  public gas: number;
  public gasPrice?: BigAmount;
  public maxGasPrice?: BigAmount;
  public priorityGasPrice?: BigAmount;
  public totalBalance: BigAmount;
  public totalTokenBalance?: BigAmount;

  private readonly zeroAmount: BigAmount;

  constructor(details: Erc20WrappedDetails, eip1559 = false) {
    const zeroAmount = amountFactory(details.blockchain)(0);

    this.address = details.address;
    this.blockchain = details.blockchain;
    this.amount = details.amount ?? zeroAmount;
    this.target = details.target ?? TxTarget.MANUAL;
    this.gas = details.gas ?? 50000;
    this.totalBalance = details.totalBalance ?? zeroAmount;
    this.totalTokenBalance = details.totalTokenBalance;

    if (eip1559 || details.maxGasPrice != null) {
      this.maxGasPrice = details.maxGasPrice ?? zeroAmount;
      this.priorityGasPrice = details.priorityGasPrice ?? zeroAmount;
    } else {
      this.gasPrice = details.gasPrice ?? zeroAmount;
    }

    this.zeroAmount = zeroAmount;
  }

  public static fromPlain(details: Erc20WrappedDetails): CreateErc20WrappedTx {
    return new CreateErc20WrappedTx(details);
  }

  public dump(): Erc20WrappedDetails {
    return {
      address: this.address,
      blockchain: this.blockchain,
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

  public getFees(): BigAmount {
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? this.zeroAmount;

    return gasPrice.multiply(this.gas);
  }

  public rebalance(): void {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.amount.units.equals(this.totalBalance.units)) {
        const amount = this.totalBalance.minus(this.getFees());

        if (amount.isZero() || amount.isPositive()) {
          this.amount = amountFactory(this.blockchain)(amount.number);
        }
      } else if (this.totalTokenBalance != null) {
        this.amount = this.totalTokenBalance;
      }
    }
  }
}
