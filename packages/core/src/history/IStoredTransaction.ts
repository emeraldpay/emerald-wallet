import BigNumber from 'bignumber.js';
import { BlockchainCode } from '../blockchains/blockchains';

export interface IStoredTransaction {
  hash?: string;
  from: string;

  // Can also be null or void
  to?: string;
  value: string | BigNumber;
  nonce: string | number;
  gas: string | number;
  gasPrice: string | BigNumber;

  // Can either be void or omitted altogether. Cannot be null
  data?: string;

  // @deprecated
  input?: string;

  replayProtected?: boolean;
  blockchain: BlockchainCode;
  chainId?: number;

  timestamp?: Date;
  blockHash?: string;
  blockNumber?: string | number;
  since?: string | Date;
  discarded?: boolean;
  broadcasted?: boolean;

  totalRetries?: number | undefined;
}
