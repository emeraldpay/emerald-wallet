import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode } from '../blockchains';

export const DEFAULT_GAS_LIMIT = 21000 as const;
export const DEFAULT_GAS_LIMIT_ERC20 = 60000 as const;

export interface EthereumBasicTransaction {
  data?: string;
  from?: string;
  gas?: number | string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  to: string;
  value?: string;
}

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
  gas: number;
  gasPrice?: BigAmount;
  maxGasPrice?: BigAmount;
  priorityGasPrice?: BigAmount;
  hash?: string;
  data?: string;
  nonce?: number;
  to?: string;
  type: EthereumTransactionType;
  value: BigAmount;
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

export function isEthereumTransaction(tx: unknown): tx is EthereumTransaction {
  return (
    typeof tx === 'object' &&
    tx != null &&
    'type' in tx &&
    typeof tx.type === 'number' &&
    tx.type in EthereumTransactionType
  );
}
