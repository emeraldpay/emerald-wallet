import BigNumber from 'bignumber.js';
import { BlockchainCode } from '../blockchains';

export interface EthereumRawTransaction {
  accessList?: string;
  blockHash?: string;
  blockNumber?: string;
  chainID?: string;
  from: string;
  gas: string;
  gasPrice: string;
  hash: string;
  input: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: string;
  to?: string;
  transactionIndex?: string;
  type: string;
  value: string;
  r: string;
  s: string;
  v: string;
}

export enum EthereumTransactionType {
  LEGACY = 0,
  EIP1559 = 2,
}

export interface EthereumTransaction {
  blockchain: BlockchainCode;
  blockNumber?: number;
  from: string;
  gas: number | string;
  gasPrice?: string | BigNumber;
  maxGasPrice?: string | BigNumber;
  priorityGasPrice?: string | BigNumber;
  hash?: string;
  data: string;
  nonce: number | string;
  to?: string;
  type: EthereumTransactionType;
  value: string | BigNumber;
}

export interface PartialEthereumTransaction<T = string | BigNumber> {
  data?: string;
  from?: string;
  gas?: number | string;
  gasPrice?: T;
  maxFeePerGas?: T;
  maxPriorityFeePerGas?: T;
  to: string;
  value?: T;
}

export interface EthereumRawReceipt {
  blockHash: string;
  blockNumber: string;
  contractAddress?: string;
  cumulativeGasUsed: string;
  effectiveGasPrice?: string;
  from: string;
  gasUsed: string;
  logs: unknown[];
  logsBloom: string;
  root: string;
  status: string;
  to?: string;
  transactionHash: string;
  transactionIndex: string;
}

export interface EthereumReceipt {
  blockHash: string;
  blockNumber: number;
  contractAddress?: string;
  cumulativeGasUsed: number;
  effectiveGasPrice?: number;
  from: string;
  gasUsed: number;
  logs: unknown[];
  logsBloom: string;
  root: string;
  status: number;
  to?: string;
  transactionHash: string;
  transactionIndex: number;
}
