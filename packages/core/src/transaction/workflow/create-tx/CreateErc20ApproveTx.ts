import { BigAmount, CreateAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import BigNumber from 'bignumber.js';
import {
  BlockchainCode,
  INFINITE_ALLOWANCE,
  Token,
  TokenAmount,
  TokenRegistry,
  amountDecoder,
  amountFactory,
  tokenAbi,
} from '../../../blockchains';
import { Contract } from '../../../Contract';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransaction, EthereumTransactionType } from '../../ethereum';
import { CommonTx, Erc20ApprovePlainTx, TxMetaType, ValidationResult } from '../types';

export enum ApproveTarget {
  MANUAL,
  MAX_AVAILABLE,
  INFINITE,
}

export interface Erc20ApproveTxDetails extends CommonTx {
  allowFor?: string;
  amount: TokenAmount;
  approveBy?: string;
  asset: string;
  blockchain: BlockchainCode;
  gas?: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  target: ApproveTarget;
  totalBalance?: WeiAny;
  totalTokenBalance?: TokenAmount;
  type: EthereumTransactionType;
}

function fromPlainTx(plain: Erc20ApprovePlainTx, tokenRegistry: TokenRegistry): Erc20ApproveTxDetails {
  const token = tokenRegistry.byAddress(plain.blockchain, plain.asset);

  const decoder = amountDecoder(plain.blockchain) as CreateAmount<WeiAny>;

  const tokenDecoder = (value: string): TokenAmount =>
    token.getAmount(TokenAmount.decode(value, token.getUnits()).number);

  return {
    allowFor: plain.allowFor,
    amount: tokenDecoder(plain.amount),
    approveBy: plain.approveBy,
    asset: plain.asset,
    blockchain: plain.blockchain,
    gas: plain.gas,
    gasPrice: plain.gasPrice == null ? undefined : decoder(plain.gasPrice),
    maxGasPrice: plain.maxGasPrice == null ? undefined : decoder(plain.maxGasPrice),
    meta: plain.meta,
    priorityGasPrice: plain.priorityGasPrice == null ? undefined : decoder(plain.priorityGasPrice),
    target: plain.target,
    totalBalance: plain.totalBalance == null ? undefined : decoder(plain.totalBalance),
    totalTokenBalance: plain.totalTokenBalance == null ? undefined : tokenDecoder(plain.totalTokenBalance),
    type: parseInt(plain.type, 16) === 2 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
  };
}

function toPlainTx(details: Erc20ApproveTxDetails): Erc20ApprovePlainTx {
  return {
    allowFor: details.allowFor,
    amount: details.amount.encode(),
    approveBy: details.approveBy,
    asset: details.asset,
    blockchain: details.blockchain,
    gas: details.gas,
    gasPrice: details.gasPrice?.encode(),
    maxGasPrice: details.maxGasPrice?.encode(),
    meta: details.meta,
    priorityGasPrice: details.priorityGasPrice?.encode(),
    target: details.target?.valueOf(),
    totalBalance: details.totalBalance?.encode(),
    totalTokenBalance: details.totalTokenBalance?.encode(),
    type: `0x${details.type.toString(16)}`,
  };
}

export class CreateErc20ApproveTx implements Erc20ApproveTxDetails {
  meta = { type: TxMetaType.ERC20_APPROVE };

  private _amount: TokenAmount;
  private _target: ApproveTarget;
  private _token: Token;

  allowFor?: string;
  approveBy?: string;
  blockchain: BlockchainCode;
  gas: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  totalBalance: WeiAny;
  totalTokenBalance: TokenAmount;
  type: EthereumTransactionType;

  private readonly zeroAmount: WeiAny;

  private readonly tokenContract = new Contract(tokenAbi);

  constructor(
    source: Erc20ApproveTxDetails | string,
    tokenRegistry: TokenRegistry,
    blockchain?: BlockchainCode,
    type = EthereumTransactionType.EIP1559,
  ) {
    let details: Erc20ApproveTxDetails;

    if (typeof source === 'string') {
      const blockchainCode = blockchain ?? BlockchainCode.Unknown;

      this._token = tokenRegistry.byAddress(blockchainCode, source);

      details = {
        type,
        amount: this.token.getAmount(0),
        asset: this.token.address,
        blockchain: blockchainCode,
        meta: this.meta,
        target: ApproveTarget.MANUAL,
      };
    } else {
      this._token = tokenRegistry.byAddress(blockchain ?? source.blockchain, source.asset);

      details = source;
    }

    const zeroTokenAmount = this.token.getAmount(0);

    switch (details.target) {
      case ApproveTarget.INFINITE:
        this._amount = this.token.getAmount(INFINITE_ALLOWANCE);

        break;
      case ApproveTarget.MAX_AVAILABLE:
        this._amount = details.totalTokenBalance ?? zeroTokenAmount;

        break;
      default:
        this._amount = details.amount;
    }

    this.zeroAmount = amountFactory(details.blockchain)(0) as WeiAny;

    this._target = details.target ?? ApproveTarget.MANUAL;

    this.approveBy = details.approveBy;
    this.allowFor = details.allowFor;
    this.blockchain = details.blockchain;
    this.gas = details.gas ?? DEFAULT_GAS_LIMIT_ERC20;
    this.gasPrice = details.gasPrice ?? this.zeroAmount;
    this.maxGasPrice = details.maxGasPrice ?? this.zeroAmount;
    this.priorityGasPrice = details.priorityGasPrice ?? this.zeroAmount;
    this.totalBalance = details.totalBalance ?? this.zeroAmount;
    this.totalTokenBalance = details.totalTokenBalance ?? zeroTokenAmount;
    this.type = details.type;
  }

  static fromPlain(plain: Erc20ApprovePlainTx, tokenRegistry: TokenRegistry): CreateErc20ApproveTx {
    return new CreateErc20ApproveTx(fromPlainTx(plain, tokenRegistry), tokenRegistry);
  }

  get amount(): TokenAmount {
    return this._amount;
  }

  set amount(value: TokenAmount | BigNumber) {
    if (TokenAmount.is(value)) {
      this._amount = value;
    } else {
      this._amount = this.token.getAmount(1).multiply(this.token.getUnits().top.multiplier).multiply(value);
    }

    this._target = ApproveTarget.MANUAL;
  }

  get asset(): string {
    return this.token.address;
  }

  get target(): ApproveTarget {
    return this._target;
  }

  set target(value: ApproveTarget) {
    this._target = value;

    switch (value) {
      case ApproveTarget.INFINITE:
        this._amount = this.token.getAmount(INFINITE_ALLOWANCE);

        break;
      case ApproveTarget.MAX_AVAILABLE:
        this._amount = this.totalTokenBalance;

        break;
    }
  }

  get token(): Token {
    return this._token;
  }

  /**
   * @deprecated Use getter
   */
  getAsset(): string {
    return this.token.address;
  }

  /**
   * @deprecated Use setter
   */
  setAmount(value: TokenAmount | BigNumber): void {
    this.amount = value;
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

  dump(): Erc20ApprovePlainTx {
    return toPlainTx(this);
  }

  getFees(): BigAmount {
    const gasPrice =
      (this.type === EthereumTransactionType.EIP1559 ? this.maxGasPrice : this.gasPrice) ?? this.zeroAmount;

    return gasPrice.multiply(this.gas);
  }

  rebalance(): void {
    const { amount, target, totalTokenBalance, token } = this;

    switch (target) {
      case ApproveTarget.INFINITE:
        this._amount = token.getAmount(INFINITE_ALLOWANCE);

        break;
      case ApproveTarget.MAX_AVAILABLE:
        this._amount = totalTokenBalance;

        break;
      default:
        this._amount = new TokenAmount(amount, token.getUnits(), token);
    }
  }

  setToken(token: Token, totalBalance: WeiAny, totalTokenBalance: TokenAmount, iep1559 = false): void {
    this._token = token;

    this.totalBalance = totalBalance;
    this.totalTokenBalance = totalTokenBalance;
    this.type = iep1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;

    this.rebalance();
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
