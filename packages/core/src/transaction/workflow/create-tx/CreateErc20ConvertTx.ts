import { BigAmount, CreateAmount, Units } from '@emeraldpay/bigamount';
import { WeiAny } from '@emeraldpay/bigamount-crypto';
import BigNumber from 'bignumber.js';
import {
  BlockchainCode,
  Blockchains,
  Token,
  TokenAmount,
  TokenRegistry,
  amountDecoder,
  amountFactory,
  wrapTokenAbi,
} from '../../../blockchains';
import { Contract } from '../../../Contract';
import { DEFAULT_GAS_LIMIT_ERC20, EthereumTransaction, EthereumTransactionType } from '../../ethereum';
import { CommonTx, Erc20ConvertPlainTx, TxMetaType, TxTarget, ValidationResult } from '../types';

export interface Erc20ConvertTxDetails extends CommonTx {
  address?: string;
  asset: string;
  amount: BigAmount;
  blockchain: BlockchainCode;
  gas?: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  target: TxTarget;
  totalBalance?: WeiAny;
  totalTokenBalance?: TokenAmount;
  type: EthereumTransactionType;
}

function fromPlainTx(plain: Erc20ConvertPlainTx, tokenRegistry: TokenRegistry): Erc20ConvertTxDetails {
  const token = tokenRegistry.getWrapped(plain.blockchain);

  const decoder = amountDecoder(plain.blockchain) as CreateAmount<WeiAny>;

  const tokenDecoder = (value: string): TokenAmount =>
    token.getAmount(TokenAmount.decode(value, token.getUnits()).number);

  return {
    address: plain.address,
    amount: tokenRegistry.hasAddress(plain.blockchain, plain.asset)
      ? tokenDecoder(plain.amount)
      : decoder(plain.amount),
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

function toPlainTx(details: Erc20ConvertTxDetails): Erc20ConvertPlainTx {
  return {
    address: details.address,
    amount: details.amount.encode(),
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

export class CreateErc20ConvertTx implements Erc20ConvertTxDetails {
  meta = { type: TxMetaType.ERC20_CONVERT };

  private _amount: BigAmount;
  private _asset: string;
  private _token: Token;

  address?: string;
  blockchain: BlockchainCode;
  gas: number;
  gasPrice?: WeiAny;
  maxGasPrice?: WeiAny;
  priorityGasPrice?: WeiAny;
  target: TxTarget;
  totalBalance: WeiAny;
  totalTokenBalance: TokenAmount;
  type: EthereumTransactionType;

  private readonly zeroAmount: WeiAny;

  private readonly tokenContract = new Contract(wrapTokenAbi);

  constructor(
    source: Erc20ConvertTxDetails | BlockchainCode,
    tokenRegistry: TokenRegistry,
    type = EthereumTransactionType.EIP1559,
  ) {
    let details: Erc20ConvertTxDetails;

    if (typeof source === 'string') {
      this._token = tokenRegistry.getWrapped(source);

      this.zeroAmount = amountFactory(source)(0) as WeiAny;

      const { coinTicker } = Blockchains[source].params;

      details = {
        type,
        amount: this.zeroAmount,
        asset: coinTicker,
        blockchain: source,
        meta: this.meta,
        target: TxTarget.MANUAL,
      };
    } else {
      this._token = tokenRegistry.getWrapped(source.blockchain);

      this.zeroAmount = amountFactory(source.blockchain)(0) as WeiAny;

      details = source;
    }

    this._amount = details.amount;
    this._asset = details.asset;

    this.address = details.address;
    this.blockchain = details.blockchain;
    this.gas = details.gas ?? DEFAULT_GAS_LIMIT_ERC20;
    this.gasPrice = details.gasPrice ?? this.zeroAmount;
    this.maxGasPrice = details.maxGasPrice ?? this.zeroAmount;
    this.priorityGasPrice = details.priorityGasPrice ?? this.zeroAmount;
    this.target = details.target;
    this.totalBalance = details.totalBalance ?? this.zeroAmount;
    this.totalTokenBalance = details.totalTokenBalance ?? this.token.getAmount(0);
    this.type = details.type;
  }

  static fromPlain(plain: Erc20ConvertPlainTx, tokenRegistry: TokenRegistry): CreateErc20ConvertTx {
    return new CreateErc20ConvertTx(fromPlainTx(plain, tokenRegistry), tokenRegistry);
  }

  get amount(): BigAmount {
    return this._amount;
  }

  set amount(value: WeiAny | TokenAmount | BigNumber) {
    if (WeiAny.is(value) || TokenAmount.is(value)) {
      this._amount = value;
    } else {
      const { asset, token } = this;

      let amount: BigAmount;
      let units: Units;

      if (asset.toLowerCase() === token.address.toLowerCase()) {
        amount = token.getAmount(1);
        units = token.getUnits();
      } else {
        units = this.amount.units;
        amount = new WeiAny(1, units);
      }

      this._amount = amount.multiply(units.top.multiplier).multiply(value);
    }

    this.target = TxTarget.MANUAL;
  }

  get asset(): string {
    return this._asset;
  }

  set asset(value: string) {
    this._asset = value;

    const { token } = this;

    if (value.toLowerCase() === token.address.toLowerCase()) {
      this._amount = token.getAmount(this.amount.number);
    } else {
      this._amount = amountFactory(this.blockchain)(this.amount.number);
    }
  }

  get token(): Token {
    return this._token;
  }

  /**
   * @deprecated Use getter
   */
  getAsset(): string {
    return this.asset;
  }

  /**
   * @deprecated Use setter
   */
  setAmount(value: TokenAmount | BigNumber): void {
    this.amount = value;
  }

  build(): EthereumTransaction {
    const {
      asset,
      amount,
      blockchain,
      gas,
      gasPrice,
      maxGasPrice,
      priorityGasPrice,
      token,
      tokenContract,
      type,
      zeroAmount,
      address: from = '',
    } = this;

    const isDeposit = asset.toLowerCase() !== token.address.toLowerCase();

    const data = isDeposit
      ? tokenContract.functionToData('deposit', {})
      : tokenContract.functionToData('withdraw', { _value: amount.number.toFixed() });

    return {
      blockchain,
      data,
      gas,
      type,
      from,
      gasPrice,
      maxGasPrice,
      priorityGasPrice,
      to: token.address,
      value: isDeposit ? amount : zeroAmount,
    };
  }

  dump(): Erc20ConvertPlainTx {
    return toPlainTx(this);
  }

  getFees(): WeiAny {
    const { gas, gasPrice, maxGasPrice, type, zeroAmount } = this;

    const price = (type === EthereumTransactionType.EIP1559 ? maxGasPrice : gasPrice) ?? zeroAmount;

    return price.multiply(gas);
  }

  rebalance(): void {
    const { asset, target, token, totalBalance, totalTokenBalance } = this;

    if (target === TxTarget.SEND_ALL) {
      if (asset.toLowerCase() === token.address.toLowerCase()) {
        this._amount = totalTokenBalance;
      } else {
        const amount = totalBalance.minus(this.getFees());

        if (amount.isZero() || amount.isPositive()) {
          this._amount = amount;
        }
      }
    }
  }

  setToken(token: Token, totalBalance: WeiAny, totalTokenBalance: TokenAmount, iep1559 = false): void {
    this._token = token;

    this.totalBalance = totalBalance;
    this.totalTokenBalance = totalTokenBalance;
    this.type = iep1559 ? EthereumTransactionType.EIP1559 : EthereumTransactionType.LEGACY;
  }

  validate(): ValidationResult {
    const { amount, asset, token, totalBalance, totalTokenBalance } = this;

    if (amount.isZero()) {
      return ValidationResult.NO_AMOUNT;
    }

    if (asset.toLowerCase() === token.address.toLowerCase()) {
      if (this.getFees().isGreaterThan(totalBalance)) {
        return ValidationResult.INSUFFICIENT_FUNDS;
      }

      if (amount.isGreaterThan(totalTokenBalance)) {
        return ValidationResult.INSUFFICIENT_TOKEN_FUNDS;
      }
    } else {
      const total = amount.plus(this.getFees());

      if (total.isGreaterThan(totalBalance)) {
        return ValidationResult.INSUFFICIENT_FUNDS;
      }
    }

    return ValidationResult.OK;
  }
}
