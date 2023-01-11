import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { Tx, TxDetailsPlain, TxTarget, ValidationResult, targetFromNumber } from './types';
import { DisplayErc20Tx, DisplayTx } from '..';
import { BlockchainCode, Token, TokenRegistry, amountDecoder, amountFactory, tokenAbi } from '../../blockchains';
import { Contract } from '../../Contract';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransaction, EthereumTransactionType } from '../../transaction/ethereum';

export enum TransferType {
  STANDARD,
  DELEGATE,
}

export interface ERC20TxDetails {
  amount: BigAmount;
  blockchain: BlockchainCode;
  from?: string;
  gas: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  target: TxTarget;
  to?: string;
  tokenSymbol: string;
  totalBalance?: WeiAny;
  totalTokenBalance?: BigAmount;
  transferType: TransferType;
  type: EthereumTransactionType;
}

const TxDefaults: Omit<ERC20TxDetails, 'amount' | 'blockchain' | 'tokenSymbol' | 'type'> = {
  from: undefined,
  gas: DEFAULT_GAS_LIMIT_ERC20,
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

function fromPlainDetails(tokenRegistry: TokenRegistry, plain: TxDetailsPlain): ERC20TxDetails {
  const units = tokenRegistry.bySymbol(plain.blockchain, plain.tokenSymbol).getUnits();

  const decoder: (value: string) => WeiAny = amountDecoder(plain.blockchain);

  return {
    amount: BigAmount.decode(plain.amount, units),
    blockchain: plain.blockchain,
    from: plain.from,
    gas: plain.gas,
    gasPrice: plain.gasPrice == null ? undefined : decoder(plain.gasPrice),
    maxGasPrice: plain.maxGasPrice == null ? undefined : decoder(plain.maxGasPrice),
    priorityGasPrice: plain.priorityGasPrice == null ? undefined : decoder(plain.priorityGasPrice),
    target: targetFromNumber(plain.target),
    to: plain.to,
    tokenSymbol: plain.tokenSymbol,
    totalBalance: plain.totalEtherBalance == null ? undefined : decoder(plain.totalEtherBalance),
    totalTokenBalance: plain.totalTokenBalance == null ? undefined : BigAmount.decode(plain.totalTokenBalance, units),
    transferType: transferFromNumber(plain.transferType),
    type: parseInt(plain.type, 16) === 2 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY,
  };
}

function toPlainDetails(tx: ERC20TxDetails): TxDetailsPlain {
  return {
    amount: tx.amount.encode(),
    amountDecimals: -1,
    blockchain: tx.blockchain,
    from: tx.from,
    gas: tx.gas,
    gasPrice: tx.gasPrice?.encode(),
    maxGasPrice: tx.maxGasPrice?.encode(),
    priorityGasPrice: tx.priorityGasPrice?.encode(),
    target: tx.target.valueOf(),
    to: tx.to,
    tokenSymbol: tx.amount.units.top.code,
    totalEtherBalance: tx.totalBalance?.encode(),
    totalTokenBalance: tx.totalTokenBalance?.encode(),
    transferType: tx.transferType.valueOf(),
    type: `0x${tx.type.toString(16)}`,
  };
}

const tokenContract = new Contract(tokenAbi);

export class CreateERC20Tx implements ERC20TxDetails, Tx<BigAmount> {
  public amount: BigAmount;
  public blockchain: BlockchainCode;
  public from?: string;
  public gas: number;
  public gasPrice?: WeiAny;
  public maxGasPrice?: WeiAny;
  public priorityGasPrice?: WeiAny;
  public target: TxTarget;
  public to?: string;
  public tokenSymbol: string;
  public totalBalance?: WeiAny;
  public totalTokenBalance?: BigAmount;
  public transferType: TransferType;
  public type: EthereumTransactionType;

  private readonly token: Token;
  private readonly zeroAmount: WeiAny;
  private readonly zeroTokenAmount: BigAmount;

  constructor(
    tokenRegistry: TokenRegistry,
    source: ERC20TxDetails | string,
    blockchain?: BlockchainCode | null,
    type = EthereumTransactionType.EIP1559,
  ) {
    let details: ERC20TxDetails;

    if (typeof source === 'string') {
      const blockchainCode = blockchain ?? BlockchainCode.Unknown;

      this.token = tokenRegistry.bySymbol(blockchainCode, source);

      details = {
        ...TxDefaults,
        type,
        amount: this.token.getAmount(0),
        blockchain: blockchainCode,
        tokenSymbol: source,
      };
    } else {
      this.token = tokenRegistry.bySymbol(source.blockchain, source.tokenSymbol);

      details = source;
    }

    this.amount = details.amount;
    this.blockchain = details.blockchain;
    this.from = details.from;
    this.gas = details.gas;
    this.target = details.target;
    this.to = details.to;
    this.tokenSymbol = details.tokenSymbol;
    this.totalBalance = details.totalBalance;
    this.totalTokenBalance = details.totalTokenBalance;
    this.transferType = details.transferType;
    this.type = details.type;

    const zeroAmount = amountFactory(details.blockchain)(0) as WeiAny;

    if (details.type === EthereumTransactionType.EIP1559) {
      this.maxGasPrice = details.maxGasPrice ?? zeroAmount;
      this.priorityGasPrice = details.priorityGasPrice ?? zeroAmount;
    } else {
      this.gasPrice = details.gasPrice ?? zeroAmount;
    }

    this.zeroAmount = zeroAmount;
    this.zeroTokenAmount = tokenRegistry.bySymbol(this.blockchain, this.tokenSymbol).getAmount(0);
  }

  public static fromPlain(tokenRegistry: TokenRegistry, details: TxDetailsPlain): CreateERC20Tx {
    return new CreateERC20Tx(tokenRegistry, fromPlainDetails(tokenRegistry, details));
  }

  public getAmount(): BigAmount {
    return this.amount;
  }

  public setAmount(amount: BigAmount, tokenSymbol?: string): void {
    if (tokenSymbol == null) {
      throw new Error('Token symbol for ERC20 must be provided');
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

  public getFees(): WeiAny {
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? this.zeroAmount;

    return gasPrice.multiply(this.gas);
  }

  public getFeesChange(): WeiAny | null {
    if (this.totalBalance == null) {
      return null;
    }

    return this.totalBalance.minus(this.getFees());
  }

  public getTokenSymbol(): string {
    return this.tokenSymbol;
  }

  public getTotal(): BigAmount {
    return this.amount;
  }

  public getTotalBalance(): BigAmount {
    return this.totalTokenBalance ? this.totalTokenBalance : this.zeroTokenAmount;
  }

  public setFrom(from: string, balance: WeiAny, tokenBalance: BigAmount): void {
    this.from = from;
    this.totalBalance = balance;
    this.totalTokenBalance = tokenBalance;
  }

  public setTotalBalance(total: BigAmount): void {
    this.totalTokenBalance = total;
  }

  public build(): EthereumTransaction {
    const { amount, blockchain, gas, gasPrice, maxGasPrice, priorityGasPrice, to, type, from = '' } = this;

    const data = tokenContract.functionToData('transfer', { _to: to, _value: amount.number.toString() });

    return {
      blockchain,
      data,
      from,
      gas,
      type,
      gasPrice: gasPrice?.number,
      maxGasPrice: maxGasPrice?.number,
      priorityGasPrice: priorityGasPrice?.number,
      to: this.token.address,
      value: this.zeroAmount.number,
    };
  }

  public display(): DisplayTx {
    return new DisplayErc20Tx(this);
  }

  public dump(): TxDetailsPlain {
    return toPlainDetails(this);
  }

  public validate(): ValidationResult {
    if (this.from == null || this.totalTokenBalance == null || this.totalBalance == null) {
      return ValidationResult.NO_FROM;
    }

    if (this.to == null) {
      return ValidationResult.NO_TO;
    }

    if (this.totalTokenBalance && this.getTotal().isGreaterThan(this.totalTokenBalance)) {
      return ValidationResult.INSUFFICIENT_TOKEN_FUNDS;
    }

    if (this.getFees().isGreaterThan(this.totalBalance)) {
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
    const gasPrice = this.maxGasPrice ?? this.gasPrice ?? this.zeroAmount;

    return (
      `Send ${this.from} -> ${this.to} of ${JSON.stringify(this.amount)} ` +
      `using ${this.gas} at ${gasPrice.toString()}.\n` +
      `Total to send: ${this.getTotal()} of token, pay ${this.getFees()} of Ether fees,` +
      `account has ${this.totalTokenBalance ?? 0}, will have ${change ?? 0}`
    );
  }
}
