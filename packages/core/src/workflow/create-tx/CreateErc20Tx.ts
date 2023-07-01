import { BigAmount } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { DisplayErc20Tx, DisplayTx } from '..';
import { BlockchainCode, Token, TokenRegistry, amountDecoder, amountFactory, tokenAbi } from '../../blockchains';
import { Contract } from '../../Contract';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransaction, EthereumTransactionType } from '../../transaction/ethereum';
import { Tx, TxDetailsPlain, TxTarget, ValidationResult, targetFromNumber } from './types';

export enum TransferType {
  STANDARD,
  DELEGATE,
}

export interface ERC20TxDetails {
  amount: BigAmount;
  asset: string;
  blockchain: BlockchainCode;
  from?: string;
  gas: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  target: TxTarget;
  to?: string;
  totalBalance?: WeiAny;
  totalTokenBalance?: BigAmount;
  transferType: TransferType;
  type: EthereumTransactionType;
}

const TxDefaults: Omit<ERC20TxDetails, 'amount' | 'asset' | 'blockchain' | 'type'> = {
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
  const units = tokenRegistry.byAddress(plain.blockchain, plain.asset).getUnits();

  const decoder: (value: string) => WeiAny = amountDecoder(plain.blockchain);

  return {
    amount: BigAmount.decode(plain.amount, units),
    asset: plain.asset,
    blockchain: plain.blockchain,
    from: plain.from,
    gas: plain.gas,
    gasPrice: plain.gasPrice == null ? undefined : decoder(plain.gasPrice),
    maxGasPrice: plain.maxGasPrice == null ? undefined : decoder(plain.maxGasPrice),
    priorityGasPrice: plain.priorityGasPrice == null ? undefined : decoder(plain.priorityGasPrice),
    target: targetFromNumber(plain.target),
    to: plain.to,
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
    asset: tx.asset,
    blockchain: tx.blockchain,
    from: tx.from,
    gas: tx.gas,
    gasPrice: tx.gasPrice?.encode(),
    maxGasPrice: tx.maxGasPrice?.encode(),
    priorityGasPrice: tx.priorityGasPrice?.encode(),
    target: tx.target.valueOf(),
    to: tx.to,
    totalEtherBalance: tx.totalBalance?.encode(),
    totalTokenBalance: tx.totalTokenBalance?.encode(),
    transferType: tx.transferType.valueOf(),
    type: `0x${tx.type.toString(16)}`,
  };
}

export class CreateERC20Tx implements ERC20TxDetails, Tx<BigAmount> {
  public amount: BigAmount;
  public blockchain: BlockchainCode;
  public asset: string;
  public from?: string;
  public gas: number;
  public gasPrice?: WeiAny;
  public maxGasPrice?: WeiAny;
  public priorityGasPrice?: WeiAny;
  public target: TxTarget;
  public to?: string;
  public totalBalance?: WeiAny;
  public totalTokenBalance?: BigAmount;
  public transferType: TransferType;
  public type: EthereumTransactionType;

  private readonly token: Token;
  private readonly tokenRegistry: TokenRegistry;
  private readonly zeroAmount: WeiAny;
  private readonly zeroTokenAmount: BigAmount;

  private tokenContract = new Contract(tokenAbi);

  constructor(
    tokenRegistry: TokenRegistry,
    source: ERC20TxDetails | string,
    blockchain?: BlockchainCode | null,
    type = EthereumTransactionType.EIP1559,
  ) {
    let details: ERC20TxDetails;

    if (typeof source === 'string') {
      const blockchainCode = blockchain ?? BlockchainCode.Unknown;

      this.token = tokenRegistry.byAddress(blockchainCode, source);

      details = {
        ...TxDefaults,
        type,
        amount: this.token.getAmount(0),
        asset: source,
        blockchain: blockchainCode,
      };
    } else {
      this.token = tokenRegistry.byAddress(source.blockchain, source.asset);

      details = source;
    }

    this.amount = details.amount;
    this.asset = details.asset;
    this.blockchain = details.blockchain;
    this.from = details.from;
    this.gas = details.gas;
    this.target = details.target;
    this.to = details.to;
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

    this.tokenRegistry = tokenRegistry;

    this.zeroAmount = zeroAmount;
    this.zeroTokenAmount = tokenRegistry.byAddress(this.blockchain, this.asset).getAmount(0);
  }

  public static fromPlain(tokenRegistry: TokenRegistry, details: TxDetailsPlain): CreateERC20Tx {
    return new CreateERC20Tx(tokenRegistry, fromPlainDetails(tokenRegistry, details));
  }

  public getAmount(): BigAmount {
    return this.amount;
  }

  public getAsset(): string {
    return this.asset;
  }

  public setAmount(amount: BigAmount): void {
    this.amount = amount;
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

    const data = this.tokenContract.functionToData('transfer', { _to: to, _value: amount.number.toString() });

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
    return new DisplayErc20Tx(this, this.tokenRegistry);
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
