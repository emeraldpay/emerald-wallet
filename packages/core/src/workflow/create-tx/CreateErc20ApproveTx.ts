import { BigAmount } from '@emeraldpay/bigamount';
import {
  BlockchainCode,
  INFINITE_ALLOWANCE,
  Token,
  TokenAmount,
  TokenData,
  amountFactory,
  tokenAbi,
} from '../../blockchains';
import { Contract } from '../../Contract';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransaction, EthereumTransactionType } from '../../transaction/ethereum';
import { ValidationResult } from './types';

export enum ApproveTarget {
  MANUAL,
  MAX_AVAILABLE,
  INFINITE,
}

export interface Erc20ApproveTxDetails {
  allowFor?: string;
  amount?: TokenAmount;
  approveBy?: string;
  blockchain: BlockchainCode;
  gas?: number;
  gasPrice?: BigAmount;
  maxGasPrice?: BigAmount;
  priorityGasPrice?: BigAmount;
  target?: ApproveTarget;
  token: TokenData;
  totalBalance: BigAmount;
  totalTokenBalance: TokenAmount;
  type: EthereumTransactionType;
}

export class CreateErc20ApproveTx implements Erc20ApproveTxDetails {
  private _amount: TokenAmount;
  private _target: ApproveTarget;
  private _token: Token;

  allowFor?: string;
  approveBy?: string;
  blockchain: BlockchainCode;
  gas: number;
  gasPrice?: BigAmount;
  maxGasPrice?: BigAmount;
  priorityGasPrice?: BigAmount;
  totalBalance: BigAmount;
  totalTokenBalance: TokenAmount;
  type: EthereumTransactionType;

  private readonly zeroAmount: BigAmount;

  private readonly tokenContract = new Contract(tokenAbi);

  constructor(details: Erc20ApproveTxDetails) {
    this._target = details.target ?? ApproveTarget.MANUAL;
    this._token = new Token(details.token);

    switch (details.target) {
      case ApproveTarget.INFINITE:
        this._amount = this._token.getAmount(INFINITE_ALLOWANCE);

        break;
      case ApproveTarget.MAX_AVAILABLE:
        this._amount = details.totalTokenBalance;

        break;
      default:
        this._amount = details.amount ?? this._token.getAmount(0);
    }

    this.approveBy = details.approveBy;
    this.allowFor = details.allowFor;
    this.blockchain = details.blockchain;
    this.gas = details.gas ?? DEFAULT_GAS_LIMIT_ERC20;
    this.totalBalance = details.totalBalance;
    this.totalTokenBalance = details.totalTokenBalance;
    this.type = details.type;

    this.zeroAmount = amountFactory(details.blockchain)(0);

    this.gasPrice = details.gasPrice ?? this.zeroAmount;
    this.maxGasPrice = details.maxGasPrice ?? this.zeroAmount;
    this.priorityGasPrice = details.priorityGasPrice ?? this.zeroAmount;
  }

  static fromPlain(details: Erc20ApproveTxDetails): CreateErc20ApproveTx {
    return new CreateErc20ApproveTx(details);
  }

  get amount(): TokenAmount {
    return this._amount;
  }

  set amount(value: TokenAmount) {
    this._amount = value;
    this._target = ApproveTarget.MANUAL;
  }

  get target(): ApproveTarget {
    return this._target;
  }

  set target(value: ApproveTarget) {
    this._target = value;

    switch (value) {
      case ApproveTarget.MAX_AVAILABLE:
        this._amount = this.totalTokenBalance;

        break;
      case ApproveTarget.INFINITE:
        this._amount = this._token.getAmount(INFINITE_ALLOWANCE);

        break;
    }
  }

  get token(): Token {
    return this._token;
  }

  build(): EthereumTransaction {
    const { blockchain, gas, gasPrice, maxGasPrice, priorityGasPrice, type, allowFor = '', approveBy = '' } = this;

    const data = this.tokenContract.functionToData('approve', {
      _spender: allowFor,
      _amount: this.amount.number.toFixed(),
    });

    return {
      blockchain,
      data,
      gas,
      gasPrice,
      maxGasPrice,
      priorityGasPrice,
      type,
      from: approveBy,
      to: this.token.address,
      value: this.zeroAmount,
    };
  }

  dump(): Erc20ApproveTxDetails {
    return {
      approveBy: this.approveBy,
      allowFor: this.allowFor,
      amount: this.amount,
      blockchain: this.blockchain,
      token: this._token.toPlain(),
      gas: this.gas,
      gasPrice: this.gasPrice,
      maxGasPrice: this.maxGasPrice,
      priorityGasPrice: this.priorityGasPrice,
      target: this._target,
      totalBalance: this.totalBalance,
      totalTokenBalance: this.totalTokenBalance,
      type: this.type,
    };
  }

  getFees(): BigAmount {
    const gasPrice =
      (this.type === EthereumTransactionType.EIP1559 ? this.maxGasPrice : this.gasPrice) ?? this.zeroAmount;

    return gasPrice.multiply(this.gas);
  }

  setToken(token: Token, totalBalance: BigAmount, totalTokenBalance: TokenAmount, iep1559 = false): void {
    this._amount = new TokenAmount(this._amount, token.getUnits(), token);
    this._token = token;
    this.totalBalance = totalBalance;
    this.totalTokenBalance = totalTokenBalance;
    this.type = iep1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;
  }

  validate(): ValidationResult {
    if (this.approveBy == null) {
      return ValidationResult.NO_FROM;
    }

    if (this.allowFor == null) {
      return ValidationResult.NO_TO;
    }

    return ValidationResult.OK;
  }
}
