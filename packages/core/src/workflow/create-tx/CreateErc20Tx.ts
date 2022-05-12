import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import BigNumber from 'bignumber.js';
import { DisplayErc20Tx, IDisplayTx } from '..';
import { AnyTokenCode } from '../../Asset';
import { tokenAmount } from '../../blockchains';
import { tokenUnits } from '../../blockchains/tokens';
import { targetFromNumber, Tx, TxDetailsPlain, TxTarget, ValidationResult } from './types';

export enum TransferType {
  STANDARD,
  DELEGATE,
}

export interface ERC20TxDetails {
  amount: BigAmount;
  erc20: string;
  from?: string;
  gas: BigNumber;
  gasPrice?: Wei;
  maxGasPrice?: Wei;
  priorityGasPrice?: Wei;
  target: TxTarget;
  to?: string;
  tokenSymbol: AnyTokenCode;
  totalEtherBalance?: Wei;
  totalTokenBalance?: BigAmount;
  transferType: TransferType;
}

const TxDefaults: Omit<ERC20TxDetails, 'amount' | 'tokenSymbol'> = {
  erc20: '',
  from: undefined,
  gas: new BigNumber(21000),
  target: TxTarget.MANUAL,
  to: undefined,
  transferType: TransferType.STANDARD,
};

export function transferFromNumber(value?: number): TransferType {
  if (value === TransferType.DELEGATE.valueOf()) {
    return TransferType.DELEGATE;
  }

  return TransferType.STANDARD;
}

function fromPlainDetails(plain: TxDetailsPlain): ERC20TxDetails {
  return {
    amount: BigAmount.decode(plain.amount, tokenUnits(plain.tokenSymbol)),
    erc20: plain.erc20 ?? '',
    from: plain.from,
    gas: new BigNumber(plain.gas),
    gasPrice: plain.gasPrice == null ? undefined : Wei.decode(plain.gasPrice),
    maxGasPrice: plain.maxGasPrice == null ? undefined : Wei.decode(plain.maxGasPrice),
    priorityGasPrice: plain.priorityGasPrice == null ? undefined : Wei.decode(plain.priorityGasPrice),
    target: targetFromNumber(plain.target),
    to: plain.to,
    tokenSymbol: plain.tokenSymbol as AnyTokenCode,
    totalEtherBalance: plain.totalEtherBalance == null ? undefined : Wei.decode(plain.totalEtherBalance),
    totalTokenBalance:
      plain.totalTokenBalance == null
        ? undefined
        : BigAmount.decode(plain.totalTokenBalance, tokenUnits(plain.tokenSymbol)),
    transferType: transferFromNumber(plain.transferType),
  };
}

function toPlainDetails(tx: ERC20TxDetails): TxDetailsPlain {
  return {
    amount: tx.amount.encode(),
    amountDecimals: -1,
    erc20: tx.erc20,
    from: tx.from,
    gas: tx.gas.toNumber(),
    gasPrice: tx.gasPrice?.encode(),
    maxGasPrice: tx.maxGasPrice?.encode(),
    priorityGasPrice: tx.priorityGasPrice?.encode(),
    target: tx.target.valueOf(),
    to: tx.to,
    tokenSymbol: tx.amount.units.top.code as AnyTokenCode,
    totalEtherBalance: tx.totalEtherBalance?.encode(),
    totalTokenBalance: tx.totalTokenBalance?.encode(),
    transferType: tx.transferType.valueOf(),
  };
}

export class CreateERC20Tx implements ERC20TxDetails, Tx<BigAmount> {
  public amount: BigAmount;
  public erc20: string;
  public from?: string;
  public gas: BigNumber;
  public gasPrice?: Wei;
  public maxGasPrice?: Wei;
  public priorityGasPrice?: Wei;
  public target: TxTarget;
  public to?: string;
  public tokenSymbol: AnyTokenCode;
  public totalEtherBalance?: Wei;
  public totalTokenBalance?: BigAmount;
  public transferType: TransferType;

  private readonly zero: BigAmount;

  constructor(source: ERC20TxDetails | AnyTokenCode) {
    let details: ERC20TxDetails;

    if (typeof source === 'string') {
      details = {
        ...TxDefaults,
        amount: tokenAmount(0, source),
        tokenSymbol: source,
      };
    } else {
      details = source;
    }

    this.from = details.from;
    this.to = details.to;
    this.erc20 = details.erc20;
    this.target = details.target;
    this.amount = details.amount;
    this.tokenSymbol = details.tokenSymbol;
    this.totalTokenBalance = details.totalTokenBalance;
    this.totalEtherBalance = details.totalEtherBalance;
    this.gasPrice = details.gasPrice;
    this.maxGasPrice = details.maxGasPrice;
    this.priorityGasPrice = details.priorityGasPrice;
    this.gas = details.gas;
    this.transferType = details.transferType;

    this.zero = tokenAmount(0, this.tokenSymbol);
  }

  public static fromPlain(details: TxDetailsPlain): CreateERC20Tx {
    return new CreateERC20Tx(fromPlainDetails(details));
  }

  public getAmount(): BigAmount {
    return this.amount;
  }

  public setAmount(amount: BigAmount, tokenSymbol?: AnyTokenCode): void {
    if (tokenSymbol == null) {
      throw Error('tokenSymbol for ERC20 must be provided');
    }

    this.amount = amount;
    this.tokenSymbol = tokenSymbol;
  }

  public getChange(): BigAmount | null {
    if (this.totalTokenBalance == null) {
      return null;
    }

    return this.totalTokenBalance.minus(this.getTotal());
  }

  public getFees(): Wei {
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? Wei.ZERO;

    return gasPrice.multiply(this.gas);
  }

  public getFeesChange(): Wei | null {
    if (this.totalEtherBalance == null) {
      return null;
    }

    return this.totalEtherBalance.minus(this.getFees());
  }

  public getTokenSymbol(): string {
    return this.tokenSymbol;
  }

  public getTotal(): BigAmount {
    return this.amount;
  }

  public getTotalBalance(): BigAmount {
    return this.totalTokenBalance ? this.totalTokenBalance : this.zero;
  }

  public setFrom(from: string, tokenBalance: BigAmount, etherBalance: Wei): void {
    this.from = from;
    this.totalEtherBalance = etherBalance;
    this.totalTokenBalance = tokenBalance;
  }

  public setTotalBalance(total: BigAmount): void {
    this.totalTokenBalance = total;
  }

  public display(): IDisplayTx {
    return new DisplayErc20Tx(this);
  }

  public dump(): TxDetailsPlain {
    return toPlainDetails(this);
  }

  public validate(): ValidationResult {
    if (this.from == null || this.totalTokenBalance == null || this.totalEtherBalance == null) {
      return ValidationResult.NO_FROM;
    }

    if (this.to == null) {
      return ValidationResult.NO_TO;
    }

    if (this.totalTokenBalance && this.getTotal().isGreaterThan(this.totalTokenBalance)) {
      return ValidationResult.INSUFFICIENT_TOKEN_FUNDS;
    }

    if (this.getFees().isGreaterThan(this.totalEtherBalance)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }

    return ValidationResult.OK;
  }

  public rebalance(): boolean {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.totalTokenBalance == null) {
        return false;
      }

      this.amount = this.totalTokenBalance;

      return true;
    }

    return true;
  }

  public debug(): string {
    const change = this.getChange();
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? Wei.ZERO;

    return (
      `Send ${this.from} -> ${this.to} of ${JSON.stringify(this.amount)} ` +
      `using ${this.gas} at ${gasPrice.toString()}.\n` +
      `Total to send: ${this.getTotal()} of token, pay ${this.getFees()} of Ether fees,` +
      `account has ${this.totalTokenBalance ?? 0}, will have ${change ?? 0}`
    );
  }
}
