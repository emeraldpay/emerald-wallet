import { EntryId } from '@emeraldpay/emerald-vault-core';
import BigNumber from 'bignumber.js';
import { BlockchainCode } from '../blockchains';

interface BaseStoredTransaction {
  /** Associated entries. May be two, if transfer is between two wallets/entries */
  entries?: EntryId[];

  blockchain: BlockchainCode;
  timestamp?: Date;

  blockHash?: string;
  blockNumber?: string | number;
  since?: string | Date;

  hash?: string;

  totalRetries?: number | undefined;

  discarded?: boolean;
  broadcasted?: boolean;
}

export interface BitcoinStoredTransaction extends BaseStoredTransaction {
  inputs: {
    txid: string;
    vout: number;
    amount: number;
    entryId?: EntryId;
    address?: string;
    hdPath?: string;
  }[];
  outputs: {
    address: string;
    amount: number;
    entryId?: EntryId;
    hdPath?: string;
  }[];
  fee: number;
}

export interface EthereumStoredTransaction extends BaseStoredTransaction {
  from: string;

  /** Can also be null or void */
  to?: string;
  value: string | BigNumber;
  nonce: string | number;
  gas: string | number;

  /**
   * Legacy gas price
   *
   * @deprecated
   */
  gasPrice?: string | BigNumber;
  maxGasPrice?: string | BigNumber;
  priorityGasPrice?: string | BigNumber;

  /** Can either be void or omitted altogether. Cannot be null */
  data?: string;

  /** @deprecated */
  input?: string;

  replayProtected?: boolean;
  chainId?: number;
}

export type IStoredTransaction = EthereumStoredTransaction | BitcoinStoredTransaction;
