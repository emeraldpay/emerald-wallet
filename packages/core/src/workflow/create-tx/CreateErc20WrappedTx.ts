import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode, Token, TokenAmount, TokenData, amountFactory, wrapTokenAbi } from '../../blockchains';
import { Contract } from '../../Contract';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransaction, EthereumTransactionType } from '../../transaction/ethereum';
import { TxTarget, ValidationResult } from './types';

export interface Erc20WrappedTxDetails {
  address?: string;
  amount?: BigAmount;
  blockchain: BlockchainCode;
  gas?: number;
  gasPrice?: BigAmount;
  maxGasPrice?: BigAmount;
  priorityGasPrice?: BigAmount;
  target?: TxTarget;
  token: TokenData;
  totalBalance: BigAmount;
  totalTokenBalance: TokenAmount;
  type: EthereumTransactionType;
}

export class CreateErc20WrappedTx {
  address?: string;
  amount: BigAmount;
  blockchain: BlockchainCode;
  gas: number;
  gasPrice?: BigAmount;
  maxGasPrice?: BigAmount;
  priorityGasPrice?: BigAmount;
  target: TxTarget;
  totalBalance: BigAmount;
  totalTokenBalance: TokenAmount;
  type: EthereumTransactionType;

  private readonly token: Token;
  private readonly zeroAmount: BigAmount;

  private tokenContract = new Contract(wrapTokenAbi);

  constructor(details: Erc20WrappedTxDetails) {
    const zeroAmount = amountFactory(details.blockchain)(0);

    this.address = details.address;
    this.amount = details.amount ?? zeroAmount;
    this.blockchain = details.blockchain;
    this.gas = details.gas ?? DEFAULT_GAS_LIMIT_ERC20;
    this.target = details.target ?? TxTarget.MANUAL;
    this.totalBalance = details.totalBalance;
    this.totalTokenBalance = details.totalTokenBalance;
    this.type = details.type;

    if (details.type === EthereumTransactionType.EIP1559) {
      this.maxGasPrice = details.maxGasPrice ?? zeroAmount;
      this.priorityGasPrice = details.priorityGasPrice ?? zeroAmount;
    } else {
      this.gasPrice = details.gasPrice ?? zeroAmount;
    }

    this.token = new Token(details.token);
    this.zeroAmount = zeroAmount;
  }

  static fromPlain(details: Erc20WrappedTxDetails): CreateErc20WrappedTx {
    return new CreateErc20WrappedTx(details);
  }

  build(): EthereumTransaction {
    const { amount, blockchain, gas, gasPrice, maxGasPrice, priorityGasPrice, totalBalance, type, address = '' } = this;

    const isDeposit = amount.units.equals(totalBalance.units);

    const data = isDeposit
      ? this.tokenContract.functionToData('deposit', {})
      : this.tokenContract.functionToData('withdraw', { _value: amount.number.toFixed() });

    return {
      blockchain,
      data,
      gas,
      type,
      from: address,
      gasPrice: gasPrice?.number,
      maxGasPrice: maxGasPrice?.number,
      priorityGasPrice: priorityGasPrice?.number,
      to: this.token.address,
      value: isDeposit ? amount.number : this.zeroAmount.number,
    };
  }

  dump(): Erc20WrappedTxDetails {
    return {
      address: this.address,
      amount: this.amount,
      blockchain: this.blockchain,
      gas: this.gas,
      gasPrice: this.gasPrice,
      maxGasPrice: this.maxGasPrice,
      priorityGasPrice: this.priorityGasPrice,
      target: this.target,
      token: this.token.toPlain(),
      totalBalance: this.totalBalance,
      totalTokenBalance: this.totalTokenBalance,
      type: this.type,
    };
  }

  getFees(): BigAmount {
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? this.zeroAmount;

    return gasPrice.multiply(this.gas);
  }

  rebalance(): void {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.amount.units.equals(this.totalBalance.units)) {
        const amount = this.totalBalance.minus(this.getFees());

        if (amount.isZero() || amount.isPositive()) {
          this.amount = amountFactory(this.blockchain)(amount.number);
        }
      } else {
        this.amount = this.totalTokenBalance;
      }
    }
  }

  validate(): ValidationResult {
    if (this.amount.isZero()) {
      return ValidationResult.NO_AMOUNT;
    }

    if (this.amount.units.equals(this.totalBalance.units)) {
      const total = this.amount.plus(this.getFees());

      if (total.isGreaterThan(this.totalBalance)) {
        return ValidationResult.INSUFFICIENT_FUNDS;
      }
    } else if (this.amount.isGreaterThan(this.totalTokenBalance)) {
      return ValidationResult.INSUFFICIENT_TOKEN_FUNDS;
    }

    return ValidationResult.OK;
  }
}
