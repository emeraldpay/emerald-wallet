import { BigAmount } from '@emeraldpay/bigamount';
import BigNumber from 'bignumber.js';
import { TokenRegistry } from '../../../blockchains';
import { AnyPlainTx, BitcoinPlainTx, CommonTx, EthereumPlainTx, TxMetaType, isBitcoinPlainTx } from '../types';
import { CreateBitcoinCancelTx } from './CreateBitcoinCancelTx';
import { CreateBitcoinSpeedUpTx } from './CreateBitcoinSpeedUpTx';
import { BitcoinTx, BitcoinTxOrigin, CreateBitcoinTx } from './CreateBitcoinTx';
import { CreateErc20CancelTx } from './CreateErc20CancelTx';
import { CreateErc20SpeedUpTx } from './CreateErc20SpeedUpTx';
import { CreateErc20Tx } from './CreateErc20Tx';
import { CreateEthereumCancelTx } from './CreateEthereumCancelTx';
import { CreateEthereumSpeedUpTx } from './CreateEthereumSpeedUpTx';
import { CreateEthereumTx } from './CreateEthereumTx';

// TODO Make unified interface for all create tx classes
export interface EthereumTx<T extends BigAmount> extends CommonTx {
  getAmount(): T;
  getAsset(): string;
  getTotalBalance(): T;
  setAmount(amount: T | BigNumber, tokenSymbol?: string): void;
  setTotalBalance(total: T): void;
}

export type AnyBitcoinCreateTx = CreateBitcoinTx | CreateBitcoinCancelTx | CreateBitcoinSpeedUpTx;
export type AnyEthereumCreateTx = CreateEthereumTx | CreateEthereumCancelTx | CreateEthereumSpeedUpTx;
export type AnyErc20CreateTx = CreateErc20Tx | CreateErc20CancelTx | CreateErc20SpeedUpTx;
export type AnyCreateTx = AnyBitcoinCreateTx | AnyEthereumCreateTx | AnyErc20CreateTx;

type BitcoinTxFactory = (...params: ConstructorParameters<typeof CreateBitcoinTx>) => BitcoinTx;

export function bitcoinTxFactory(metaType: TxMetaType): BitcoinTxFactory {
  return (...params) => {
    switch (metaType) {
      case TxMetaType.BITCOIN_CANCEL:
        return new CreateBitcoinCancelTx(...params);
      case TxMetaType.BITCOIN_SPEEDUP:
        return new CreateBitcoinSpeedUpTx(...params);
      case TxMetaType.BITCOIN_TRANSFER:
        return new CreateBitcoinTx(...params);
      default:
        throw new Error();
    }
  };
}

const bitcoinTxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.BITCOIN_CANCEL,
  TxMetaType.BITCOIN_SPEEDUP,
  TxMetaType.BITCOIN_TRANSFER,
];

const ethereumTxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.ETHEREUM_CANCEL,
  TxMetaType.ETHEREUM_SPEEDUP,
  TxMetaType.ETHEREUM_TRANSFER,
];

const erc20TxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.ERC20_CANCEL,
  TxMetaType.ERC20_SPEEDUP,
  TxMetaType.ERC20_TRANSFER,
];

export function isAnyBitcoinCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinTx {
  return bitcoinTxMetaTypes.includes(createTx.meta.type);
}

export function isBitcoinCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinCancelTx {
  return createTx.meta.type === TxMetaType.BITCOIN_TRANSFER;
}

export function isBitcoinCancelCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinCancelTx {
  return createTx.meta.type === TxMetaType.BITCOIN_CANCEL;
}

export function isBitcoinSpeedUpCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinCancelTx {
  return createTx.meta.type === TxMetaType.BITCOIN_SPEEDUP;
}

export function isAnyEthereumCreateTx(createTx: AnyCreateTx): createTx is AnyEthereumCreateTx {
  return ethereumTxMetaTypes.includes(createTx.meta.type);
}

export function isEthereumCreateTx(createTx: AnyCreateTx): createTx is CreateEthereumTx {
  return createTx.meta.type === TxMetaType.ETHEREUM_TRANSFER;
}

export function isEthereumCancelCreateTx(createTx: AnyCreateTx): createTx is CreateEthereumCancelTx {
  return createTx.meta.type === TxMetaType.ETHEREUM_CANCEL;
}

export function isEthereumSpeedUpCreateTx(createTx: AnyCreateTx): createTx is CreateEthereumSpeedUpTx {
  return createTx.meta.type === TxMetaType.ETHEREUM_SPEEDUP;
}

export function isAnyErc20CreateTx(createTx: AnyCreateTx): createTx is AnyErc20CreateTx {
  return erc20TxMetaTypes.includes(createTx.meta.type);
}

export function isErc20CreateTx(createTx: AnyCreateTx): createTx is CreateErc20Tx {
  return createTx.meta.type === TxMetaType.ERC20_TRANSFER;
}

export function isErc20CancelCreateTx(createTx: AnyCreateTx): createTx is CreateErc20CancelTx {
  return createTx.meta.type === TxMetaType.ERC20_CANCEL;
}

export function isErc20SpeedUpCreateTx(createTx: AnyCreateTx): createTx is CreateErc20SpeedUpTx {
  return createTx.meta.type === TxMetaType.ERC20_SPEEDUP;
}

export function fromBitcoinPlainTx(transaction: BitcoinPlainTx, origin: BitcoinTxOrigin): AnyBitcoinCreateTx {
  switch (transaction.meta.type) {
    case TxMetaType.BITCOIN_CANCEL:
      return CreateBitcoinCancelTx.fromPlain(origin, transaction);
    case TxMetaType.BITCOIN_SPEEDUP:
      return CreateBitcoinSpeedUpTx.fromPlain(origin, transaction);
    case TxMetaType.BITCOIN_TRANSFER:
      return CreateBitcoinTx.fromPlain(origin, transaction);
  }

  throw new Error('Unsupported transaction meta type');
}

export function fromEthereumPlainTx(transaction: EthereumPlainTx): AnyEthereumCreateTx {
  switch (transaction.meta.type) {
    case TxMetaType.ETHEREUM_CANCEL:
      return CreateEthereumCancelTx.fromPlain(transaction);
    case TxMetaType.ETHEREUM_SPEEDUP:
      return CreateEthereumSpeedUpTx.fromPlain(transaction);
    case TxMetaType.ETHEREUM_TRANSFER:
      return CreateEthereumTx.fromPlain(transaction);
  }

  throw new Error('Unsupported transaction meta type');
}

export function fromErc20PlainTx(transaction: EthereumPlainTx, tokenRegistry: TokenRegistry): AnyErc20CreateTx {
  switch (transaction.meta.type) {
    case TxMetaType.ERC20_CANCEL:
      return CreateErc20CancelTx.fromPlain(tokenRegistry, transaction);
    case TxMetaType.ERC20_SPEEDUP:
      return CreateErc20SpeedUpTx.fromPlain(tokenRegistry, transaction);
    case TxMetaType.ERC20_TRANSFER:
      return CreateErc20Tx.fromPlain(tokenRegistry, transaction);
  }

  throw new Error('Unsupported transaction meta type');
}

export function fromPlainTx(
  transaction: AnyPlainTx,
  origin: BitcoinTxOrigin,
  tokenRegistry: TokenRegistry,
): AnyCreateTx {
  if (isBitcoinPlainTx(transaction)) {
    return fromBitcoinPlainTx(transaction, origin);
  }

  if (tokenRegistry.hasAddress(transaction.blockchain, transaction.asset)) {
    return fromErc20PlainTx(transaction, tokenRegistry);
  }

  return fromEthereumPlainTx(transaction);
}
