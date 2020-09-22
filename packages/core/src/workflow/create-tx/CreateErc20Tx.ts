import BigNumber from 'bignumber.js';
import {DisplayErc20Tx, IDisplayTx} from '..';
import {ITx, ITxDetailsPlain, targetFromNumber, TxTarget, ValidationResult} from './types';
import {BigAmount} from "@emeraldpay/bigamount";
import {Wei} from "@emeraldpay/bigamount-crypto";
import {tokenAmount} from "../../blockchains";
import {AnyTokenCode} from "../../Asset";
import {tokenUnits} from "../../blockchains/tokens";

export enum TransferType {
  STANDARD,
  DELEGATE
}

export function transferFromNumber(i?: number): TransferType {
  if (i === TransferType.DELEGATE.valueOf()) {
    return TransferType.DELEGATE;
  }
  return TransferType.STANDARD;
}

export interface IERC20TxDetails {
  from?: string;
  to?: string;
  erc20: string;
  target: TxTarget;
  amount: BigAmount;
  tokenSymbol: AnyTokenCode;
  totalTokenBalance?: BigAmount;
  totalEtherBalance?: Wei;
  gasPrice: Wei;
  gas: BigNumber;
  transferType: TransferType;
}

const TxDefaults: Partial<IERC20TxDetails> = {
  from: undefined,
  to: undefined,
  target: TxTarget.MANUAL,
  gasPrice: Wei.ZERO,
  gas: new BigNumber(21000),
  transferType: TransferType.STANDARD
};

function toPlainDetails(tx: IERC20TxDetails): ITxDetailsPlain {
  return {
    from: tx.from,
    to: tx.to,
    erc20: tx.erc20,
    target: tx.target.valueOf(),
    amount: tx.amount.encode(),
    amountDecimals: -1,
    totalTokenBalance: tx.totalTokenBalance?.encode(),
    totalEtherBalance: tx.totalEtherBalance?.encode(),
    gasPrice: tx.gasPrice.encode(),
    gas: tx.gas.toNumber(),
    transferType: tx.transferType.valueOf(),
    tokenSymbol: tx.amount.units.top.code as AnyTokenCode
  };
}

function fromPlainDetails(plain: ITxDetailsPlain): IERC20TxDetails {
  return {
    amount: BigAmount.decode(plain.amount, tokenUnits(plain.tokenSymbol)),
    erc20: plain.erc20 || '',
    from: plain.from,
    target: targetFromNumber(plain.target),
    to: plain.to,
    totalTokenBalance: plain.totalTokenBalance == null ? undefined
      : BigAmount.decode(plain.totalTokenBalance, tokenUnits(plain.tokenSymbol)),
    totalEtherBalance: plain.totalEtherBalance == null ? undefined : Wei.decode(plain.totalEtherBalance),
    gasPrice: Wei.decode(plain.gasPrice),
    gas: new BigNumber(plain.gas),
    transferType: transferFromNumber(plain.transferType),
    tokenSymbol: plain.tokenSymbol as AnyTokenCode
  };
}

export class CreateERC20Tx implements IERC20TxDetails, ITx<BigAmount> {

  public static fromPlain(details: ITxDetailsPlain): CreateERC20Tx {
    return new CreateERC20Tx(fromPlainDetails(details));
  }

  public from?: string;
  public to?: string;
  public erc20: string;
  public target: TxTarget;
  public amount: BigAmount;
  public tokenSymbol: AnyTokenCode;
  public totalTokenBalance?: BigAmount;
  public totalEtherBalance?: Wei;
  public gasPrice: Wei;
  public gas: BigNumber;
  public transferType: TransferType;

  private zero: BigAmount

  constructor(source: IERC20TxDetails | AnyTokenCode) {
    if (typeof source === "string") {
      source = {
        amount: tokenAmount(0, source),
        tokenSymbol: source,
        ...TxDefaults,
      } as IERC20TxDetails;
    }
    this.from = source.from;
    this.to = source.to;
    this.erc20 = source.erc20;
    this.target = source.target;
    this.amount = source.amount;
    this.tokenSymbol = source.tokenSymbol;
    this.totalTokenBalance = source.totalTokenBalance;
    this.totalEtherBalance = source.totalEtherBalance;
    this.gasPrice = source.gasPrice;
    this.gas = source.gas;
    this.transferType = source.transferType;

    this.zero = tokenAmount(0, this.tokenSymbol);
  }

  public display(): IDisplayTx {
    return new DisplayErc20Tx(this);
  }

  public getTotalBalance(): BigAmount {
    return this.totalTokenBalance ? this.totalTokenBalance : this.zero;
  }

  public getAmount(): BigAmount {
    return this.amount;
  }

  public setAmount(a: BigAmount, tokenSymbol?: AnyTokenCode) {
    if (!tokenSymbol) {
      throw Error('tokenSymbol for ERC20 must be provided');
    }
    this.amount = a;
    this.tokenSymbol = tokenSymbol;
  }

  public dump (): ITxDetailsPlain {
    return toPlainDetails(this);
  }

  public setFrom(from: string, tokenBalance: BigAmount, etherBalance: Wei) {
    this.from = from;
    this.totalTokenBalance = tokenBalance;
    this.totalEtherBalance = etherBalance;
  }

  public validate (): ValidationResult {
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

  public getTotal(): BigAmount {
    return this.amount;
  }

  public getChange(): BigAmount | null {
    if (this.totalTokenBalance == null) {
      return null;
    }
    return this.totalTokenBalance.minus(this.getTotal());
  }

  public getFeesChange (): (Wei | null) {
    if (this.totalEtherBalance == null) {
      return null;
    }
    return this.totalEtherBalance.minus(this.getFees());
  }

  public getFees (): Wei {
    return this.gasPrice.multiply(this.gas)
  }

  public rebalance (): boolean {
    if (this.target === TxTarget.SEND_ALL) {
      if (this.totalTokenBalance == null) {
        return false;
      }
      this.amount = this.totalTokenBalance;
      return true;
    }
    return true;
  }

  public debug (): string {
    const change = this.getChange();
    return `Send ${this.from} -> ${this.to} of ${JSON.stringify(this.amount)} using ${this.gas} at ${this.gasPrice.toString()}.\n` +
      `Total to send: ${this.getTotal()} of token, pay ${this.getFees()} of Ether fees,` +
      `account has ${this.totalTokenBalance}, will have ${change}`;

  }

  public setTotalBalance(total: BigAmount): void {
    this.totalTokenBalance = total;
  }

  public getTokenSymbol (): string {
    return this.tokenSymbol;
  }
}
