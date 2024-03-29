import { BigAmount } from '@emeraldpay/bigamount';
import BigNumber from 'bignumber.js';
import { TokenRegistry } from '../../../blockchains';
import {
  AnyPlainTx,
  BitcoinPlainTx,
  CommonTx,
  EthereumPlainTx,
  TxMetaType,
  isBitcoinPlainTx,
  isErc20ApprovePlainTx,
  isErc20ConvertPlainTx,
} from '../types';
import { CreateBitcoinCancelTx } from './CreateBitcoinCancelTx';
import { CreateBitcoinSpeedUpTx } from './CreateBitcoinSpeedUpTx';
import { BitcoinTxOrigin, CreateBitcoinTx } from './CreateBitcoinTx';
import { CreateErc20ApproveTx } from './CreateErc20ApproveTx';
import { CreateErc20CancelTx } from './CreateErc20CancelTx';
import { CreateErc20ConvertTx } from './CreateErc20ConvertTx';
import { CreateErc20RecoveryTx } from './CreateErc20RecoveryTx';
import { CreateErc20SpeedUpTx } from './CreateErc20SpeedUpTx';
import { CreateErc20Tx } from './CreateErc20Tx';
import { CreateEtherCancelTx } from './CreateEtherCancelTx';
import { CreateEtherRecoveryTx } from './CreateEtherRecoveryTx';
import { CreateEtherSpeedUpTx } from './CreateEtherSpeedUpTx';
import { CreateEtherTx } from './CreateEtherTx';

// TODO Make unified interface for all create tx classes
export interface EthereumTx<T extends BigAmount> extends CommonTx {
  getAmount(): T;
  getAsset(): string;
  getTotalBalance(): T;
  setAmount(amount: T | BigNumber, tokenSymbol?: string): void;
  setTotalBalance(total: T): void;
}

export type AnyBitcoinCreateTx = CreateBitcoinTx | CreateBitcoinCancelTx | CreateBitcoinSpeedUpTx;
export type AnyEtherCreateTx = CreateEtherTx | CreateEtherCancelTx | CreateEtherSpeedUpTx;
export type AnyErc20CreateTx = CreateErc20Tx | CreateErc20CancelTx | CreateErc20SpeedUpTx;
export type AnyContractCreateTx = AnyErc20CreateTx | CreateErc20ApproveTx | CreateErc20ConvertTx;
export type AnyEthereumRecoveryTx = CreateEtherRecoveryTx | CreateErc20RecoveryTx;
export type AnyEthereumCreateTx = AnyEtherCreateTx | AnyContractCreateTx | AnyEthereumRecoveryTx;
export type AnyCreateTx = AnyBitcoinCreateTx | AnyEthereumCreateTx;

const bitcoinTxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.BITCOIN_CANCEL,
  TxMetaType.BITCOIN_SPEEDUP,
  TxMetaType.BITCOIN_TRANSFER,
];

const etherTxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.ETHER_CANCEL,
  TxMetaType.ETHER_RECOVERY,
  TxMetaType.ETHER_SPEEDUP,
  TxMetaType.ETHER_TRANSFER,
];

const erc20TxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.ERC20_CANCEL,
  TxMetaType.ERC20_RECOVERY,
  TxMetaType.ERC20_SPEEDUP,
  TxMetaType.ERC20_TRANSFER,
];

const contractTxMetaTypes: Readonly<TxMetaType[]> = [
  ...erc20TxMetaTypes,
  TxMetaType.ERC20_APPROVE,
  TxMetaType.ERC20_CONVERT,
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

export function isAnyEtherCreateTx(createTx: AnyCreateTx): createTx is AnyEtherCreateTx {
  return etherTxMetaTypes.includes(createTx.meta.type);
}

export function isEtherCreateTx(createTx: AnyCreateTx): createTx is CreateEtherTx {
  return createTx.meta.type === TxMetaType.ETHER_TRANSFER;
}

export function isEtherCancelCreateTx(createTx: AnyCreateTx): createTx is CreateEtherCancelTx {
  return createTx.meta.type === TxMetaType.ETHER_CANCEL;
}

export function isEtherRecoveryCreateTx(createTx: AnyCreateTx): createTx is CreateEtherRecoveryTx {
  return createTx.meta.type === TxMetaType.ETHER_RECOVERY;
}

export function isEtherSpeedUpCreateTx(createTx: AnyCreateTx): createTx is CreateEtherSpeedUpTx {
  return createTx.meta.type === TxMetaType.ETHER_SPEEDUP;
}

export function isAnyContractCreateTx(createTx: AnyCreateTx): createTx is AnyContractCreateTx {
  return contractTxMetaTypes.includes(createTx.meta.type);
}

export function isAnyErc20CreateTx(createTx: AnyCreateTx): createTx is AnyErc20CreateTx {
  return erc20TxMetaTypes.includes(createTx.meta.type);
}

export function isErc20CreateTx(createTx: AnyCreateTx): createTx is CreateErc20Tx {
  return createTx.meta.type === TxMetaType.ERC20_TRANSFER;
}

export function isErc20ApproveCreateTx(createTx: AnyCreateTx): createTx is CreateErc20ApproveTx {
  return createTx.meta.type === TxMetaType.ERC20_APPROVE;
}

export function isErc20CancelCreateTx(createTx: AnyCreateTx): createTx is CreateErc20CancelTx {
  return createTx.meta.type === TxMetaType.ERC20_CANCEL;
}

export function isErc20ConvertCreateTx(createTx: AnyCreateTx): createTx is CreateErc20ConvertTx {
  return createTx.meta.type === TxMetaType.ERC20_CONVERT;
}

export function isErc20RecoveryCreateTx(createTx: AnyCreateTx): createTx is CreateErc20RecoveryTx {
  return createTx.meta.type === TxMetaType.ERC20_RECOVERY;
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

  throw new Error(`Unsupported transaction meta type ${transaction.meta.type}`);
}

export function fromEtherPlainTx(transaction: EthereumPlainTx): AnyEtherCreateTx {
  switch (transaction.meta.type) {
    case TxMetaType.ETHER_CANCEL:
      return CreateEtherCancelTx.fromPlain(transaction);
    case TxMetaType.ETHER_RECOVERY:
      return CreateEtherRecoveryTx.fromPlain(transaction);
    case TxMetaType.ETHER_SPEEDUP:
      return CreateEtherSpeedUpTx.fromPlain(transaction);
    case TxMetaType.ETHER_TRANSFER:
      return CreateEtherTx.fromPlain(transaction);
  }

  throw new Error(`Unsupported transaction meta type ${transaction.meta.type}`);
}

export function fromErc20PlainTx(transaction: EthereumPlainTx, tokenRegistry: TokenRegistry): AnyContractCreateTx {
  switch (transaction.meta.type) {
    case TxMetaType.ERC20_APPROVE:
      return CreateErc20ApproveTx.fromPlain(transaction, tokenRegistry);
    case TxMetaType.ERC20_CANCEL:
      return CreateErc20CancelTx.fromPlain(transaction, tokenRegistry);
    case TxMetaType.ERC20_CONVERT:
      return CreateErc20ConvertTx.fromPlain(transaction, tokenRegistry);
    case TxMetaType.ERC20_RECOVERY:
      return CreateErc20RecoveryTx.fromPlain(transaction, tokenRegistry);
    case TxMetaType.ERC20_SPEEDUP:
      return CreateErc20SpeedUpTx.fromPlain(transaction, tokenRegistry);
    case TxMetaType.ERC20_TRANSFER:
      return CreateErc20Tx.fromPlain(transaction, tokenRegistry);
  }

  throw new Error(`Unsupported transaction meta type ${transaction.meta.type}`);
}

export function fromEthereumPlainTx(transaction: EthereumPlainTx, tokenRegistry: TokenRegistry): AnyEthereumCreateTx {
  if (
    isErc20ApprovePlainTx(transaction) ||
    isErc20ConvertPlainTx(transaction) ||
    tokenRegistry.hasAddress(transaction.blockchain, transaction.asset)
  ) {
    return fromErc20PlainTx(transaction, tokenRegistry);
  }

  return fromEtherPlainTx(transaction);
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
