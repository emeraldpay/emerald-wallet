import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, InputUtxo, isBitcoin, isEthereum } from '../../blockchains';

export enum TxTarget {
  MANUAL,
  SEND_ALL,
}

export enum TxMetaType {
  BITCOIN_CANCEL,
  BITCOIN_SPEEDUP,
  BITCOIN_TRANSFER,
  ETHER_CANCEL,
  ETHER_RECOVERY,
  ETHER_SPEEDUP,
  ETHER_TRANSFER,
  ERC20_APPROVE,
  ERC20_CANCEL,
  ERC20_SPEEDUP,
  ERC20_TRANSFER,
  ERC20_WRAP,
}

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

export interface TxMeta {
  type: TxMetaType;
}

export interface CommonTx {
  meta: TxMeta;
}

export interface BitcoinPlainTx extends CommonTx {
  amount: string;
  blockchain: BlockchainCode;
  changeAddress?: string;
  target: number;
  to?: string;
  vkbPrice: number;
  utxo: InputUtxo[];
}

export interface EthereumPlainTx extends CommonTx {
  amount: string;
  asset: string;
  blockchain: BlockchainCode;
  from?: string;
  gas: number;
  gasPrice?: string;
  maxGasPrice?: string;
  nonce?: number;
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

export function isEthereumPlainTx(transaction: BitcoinPlainTx | EthereumPlainTx): transaction is EthereumPlainTx {
  return isEthereum(transaction.blockchain);
}

export interface BitcoinFeeRange {
  std: number;
  min: number;
  max: number;
}

export interface EthereumFeeRange<T = WeiAny> {
  stdMaxGasPrice: T;
  lowMaxGasPrice: T;
  highMaxGasPrice: T;
  stdPriorityGasPrice: T;
  lowPriorityGasPrice: T;
  highPriorityGasPrice: T;
}

export type FeeRange = BitcoinFeeRange | EthereumFeeRange;

export function isBitcoinFeeRange(feeRange: unknown): feeRange is BitcoinFeeRange {
  return feeRange != null && typeof feeRange === 'object' && 'std' in feeRange && typeof feeRange.std === 'number';
}

export function isEthereumFeeRange<T>(feeRange: unknown): feeRange is EthereumFeeRange<T> {
  return (
    feeRange != null && typeof feeRange === 'object' && 'stdMaxGasPrice' in feeRange && feeRange.stdMaxGasPrice != null
  );
}
