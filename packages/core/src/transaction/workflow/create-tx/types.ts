import { BigAmount } from '@emeraldpay/bigamount';
import BigNumber from 'bignumber.js';
import { Blockchains, TokenRegistry } from '../../../blockchains';
import { AnyPlainTx, BitcoinPlainTx, CommonTx, EthereumPlainTx, TxMetaType, isBitcoinPlainTx } from '../types';
import { CreateBitcoinCancelTx } from './CreateBitcoinCancelTx';
import { CreateBitcoinSpeedUpTx } from './CreateBitcoinSpeedUpTx';
import { BitcoinTx, BitcoinTxOrigin, CreateBitcoinTx } from './CreateBitcoinTx';
import { CreateERC20Tx } from './CreateErc20Tx';
import { CreateEthereumTx } from './CreateEthereumTx';

// TODO Make unified interface for all create tx classes
export interface EthereumTx<T extends BigAmount> extends CommonTx {
  getAmount(): T;
  getAsset(): string;
  getTotalBalance(): T;
  setAmount(amount: T | BigNumber, tokenSymbol?: string): void;
  setTotalBalance(total: T): void;
}

export type AnyBitcoinCreateTx = CreateBitcoinTx | CreateBitcoinCancelTx;
export type AnyEthereumCreateTx = CreateEthereumTx | CreateERC20Tx;
export type AnyCreateTx = AnyBitcoinCreateTx | AnyEthereumCreateTx;

type BitcoinTxFactory = (...params: ConstructorParameters<typeof CreateBitcoinTx>) => BitcoinTx;

export function bitcoinTxFactory(metaType: TxMetaType): BitcoinTxFactory {
  return (...params) => {
    switch (metaType) {
      case TxMetaType.BITCOIN_CANCEL:
        return new CreateBitcoinCancelTx(...params);
      case TxMetaType.BITCOIN_SPEED_UP:
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
  TxMetaType.BITCOIN_SPEED_UP,
  TxMetaType.BITCOIN_TRANSFER,
];

const ethereumTxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.ETHEREUM_APPROVE,
  TxMetaType.ETHEREUM_CANCEL,
  TxMetaType.ETHEREUM_RECOVERY,
  TxMetaType.ETHEREUM_SPEED_UP,
  TxMetaType.ETHEREUM_TRANSFER,
  TxMetaType.ETHEREUM_WRAP,
];

export function isAnyBitcoinCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinTx {
  return bitcoinTxMetaTypes.includes(createTx.meta.type);
}

export function isBitcoinCancelCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinCancelTx {
  return createTx.meta.type === TxMetaType.BITCOIN_CANCEL;
}

export function isBitcoinSpeedUpCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinCancelTx {
  return createTx.meta.type === TxMetaType.BITCOIN_SPEED_UP;
}

export function isAnyEthereumCreateTx(createTx: AnyCreateTx): createTx is AnyEthereumCreateTx {
  return ethereumTxMetaTypes.includes(createTx.meta.type);
}

export function isEthereumCreateTx(createTx: AnyCreateTx): createTx is CreateEthereumTx {
  return isAnyEthereumCreateTx(createTx) && createTx.getAsset() === Blockchains[createTx.blockchain].params.coinTicker;
}

export function isErc20CreateTx(createTx: AnyCreateTx, tokenRegistry: TokenRegistry): createTx is CreateERC20Tx {
  return isAnyEthereumCreateTx(createTx) && tokenRegistry.hasAddress(createTx.blockchain, createTx.getAsset());
}

export function fromBitcoinPlainTx(transaction: BitcoinPlainTx, origin: BitcoinTxOrigin): AnyBitcoinCreateTx {
  switch (transaction.meta.type) {
    case TxMetaType.BITCOIN_CANCEL:
      return CreateBitcoinCancelTx.fromPlain(origin, transaction);
    case TxMetaType.BITCOIN_SPEED_UP:
      return CreateBitcoinSpeedUpTx.fromPlain(origin, transaction);
    default:
      return CreateBitcoinTx.fromPlain(origin, transaction);
  }
}

export function fromEthereumPlainTx(transaction: EthereumPlainTx, tokenRegistry: TokenRegistry): AnyEthereumCreateTx {
  // TODO Use meta to detect transaction type
  if (tokenRegistry.hasAddress(transaction.blockchain, transaction.asset)) {
    return CreateERC20Tx.fromPlain(tokenRegistry, transaction);
  }

  return CreateEthereumTx.fromPlain(transaction);
}

export function fromPlainTx(
  transaction: AnyPlainTx,
  origin: BitcoinTxOrigin,
  tokenRegistry: TokenRegistry,
): AnyCreateTx {
  if (isBitcoinPlainTx(transaction)) {
    return fromBitcoinPlainTx(transaction, origin);
  }

  return fromEthereumPlainTx(transaction, tokenRegistry);
}
