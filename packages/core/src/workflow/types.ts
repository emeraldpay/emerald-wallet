import { BigAmount } from '@emeraldpay/bigamount';
import { SatoshiAny, WeiAny } from '@emeraldpay/bigamount-crypto';
import BigNumber from 'bignumber.js';
import { BlockchainCode, TokenRegistry, isBitcoin } from '../blockchains';
import { CreateBitcoinTx } from './CreateBitcoinTx';
import { CreateERC20Tx } from './CreateErc20Tx';
import { CreateEthereumTx } from './CreateEthereumTx';

export enum ValidationResult {
  INSUFFICIENT_FEE_PRICE,
  INSUFFICIENT_FUNDS,
  INSUFFICIENT_TOKEN_FUNDS,
  NO_CHANGE_ADDRESS,
  NO_AMOUNT,
  NO_FROM,
  NO_TO,
  OK,
}

export enum TxTarget {
  MANUAL,
  SEND_ALL,
}

/**
 * TODO Make unified interface for all create tx classes
 */
export interface EthereumTx<T extends BigAmount> {
  getAmount(): T;
  getAsset(): string;
  getTotalBalance(): T;
  setAmount(amount: T | BigNumber, tokenSymbol?: string): void;
  setTotalBalance(total: T): void;
}

export type AnyEthereumCreateTx = CreateEthereumTx | CreateERC20Tx;
export type AnyCreateTx = CreateBitcoinTx | AnyEthereumCreateTx;

export function isBitcoinCreateTx(createTx: AnyCreateTx): createTx is CreateBitcoinTx {
  return 'amount' in createTx && SatoshiAny.is(createTx.amount);
}

export function isEthereumCreateTx(createTx: AnyCreateTx): createTx is CreateEthereumTx {
  return 'amount' in createTx && WeiAny.is(createTx.amount);
}

export function isErc20CreateTx(createTx: AnyCreateTx, tokenRegistry: TokenRegistry): createTx is CreateERC20Tx {
  return (
    'getAsset' in createTx &&
    typeof createTx.getAsset === 'function' &&
    tokenRegistry.hasAddress(createTx.blockchain, createTx.getAsset())
  );
}

export function isAnyEthereumCreateTx(
  createTx: AnyCreateTx,
  tokenRegistry: TokenRegistry,
): createTx is AnyEthereumCreateTx {
  return isEthereumCreateTx(createTx) || isErc20CreateTx(createTx, tokenRegistry);
}

export interface BitcoinPlainTx {
  amount: string;
  blockchain: BlockchainCode;
  target: number;
  to?: string;
  vkbPrice: number;
}

export interface EthereumPlainTx {
  amount: string;
  asset: string;
  blockchain: BlockchainCode;
  from?: string;
  gas: number;
  gasPrice?: string;
  maxGasPrice?: string;
  priorityGasPrice?: string;
  target: number;
  to?: string;
  totalBalance?: string;
  totalTokenBalance?: string;
  transferFrom?: string;
  type: string;
}

export type AnyPlainTx = BitcoinPlainTx | EthereumPlainTx;

export function isBitcoinPlainTx(transaction: BitcoinPlainTx | EthereumPlainTx): transaction is BitcoinPlainTx {
  return isBitcoin(transaction.blockchain);
}
