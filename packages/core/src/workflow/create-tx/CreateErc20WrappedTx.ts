import { BigAmount } from '@emeraldpay/bigamount';
import { TxTarget } from './types';
import { BlockchainCode, amountFactory } from '../../blockchains';
import { EthereumTransactionType } from '../../transaction/ethereum';

export interface Erc20WrappedDetails {
  address?: string;
  amount?: BigAmount;
  blockchain: BlockchainCode;
  gas?: number;
  gasPrice?: BigAmount;
  maxGasPrice?: BigAmount;
  priorityGasPrice?: BigAmount;
  target?: TxTarget;
  totalBalance?: BigAmount;
  totalTokenBalance?: BigAmount;
  type: EthereumTransactionType;
}

export class CreateErc20WrappedTx {
  public address?: string;
  public amount: BigAmount;
  public blockchain: BlockchainCode;
  public gas: number;
  public gasPrice?: BigAmount;
  public maxGasPrice?: BigAmount;
  public priorityGasPrice?: BigAmount;
  public target: TxTarget;
  public totalBalance: BigAmount;
  public totalTokenBalance?: BigAmount;
  public type: EthereumTransactionType;

  private readonly zeroAmount: BigAmount;

  constructor(details: Erc20WrappedDetails) {
    const zeroAmount = amountFactory(details.blockchain)(0);

    this.address = details.address;
    this.amount = details.amount ?? zeroAmount;
    this.blockchain = details.blockchain;
    this.gas = details.gas ?? 50000;
    this.target = details.target ?? TxTarget.MANUAL;
    this.totalBalance = details.totalBalance ?? zeroAmount;
    this.totalTokenBalance = details.totalTokenBalance;
    this.type = details.type;

    if (details.type === EthereumTransactionType.EIP1559) {
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
      amount: this.amount,
      blockchain: this.blockchain,
      gas: this.gas,
      gasPrice: this.gasPrice,
      maxGasPrice: this.maxGasPrice,
      priorityGasPrice: this.priorityGasPrice,
      target: this.target,
      totalBalance: this.totalBalance,
      totalTokenBalance: this.totalTokenBalance,
      type: this.type,
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
