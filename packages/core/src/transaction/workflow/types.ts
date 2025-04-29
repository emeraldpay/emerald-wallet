import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, InputUtxo, isBitcoin, isEthereum } from '../../blockchains';
import { UtxoOrder } from './create-tx';

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
  ERC20_CONVERT,
  ERC20_RECOVERY,
  ERC20_SPEEDUP,
  ERC20_TRANSFER,
}

export enum ValidationResult {
  INCORRECT_TARGET_AMOUNT,
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
  originalFees: string;
  target: number;
  to?: string;
  vkbPrice: number;
  utxo: InputUtxo[];
  utxoOrder: UtxoOrder;
}

export interface EthereumPlainTx extends CommonTx {
  amount: string;
  asset: string;
  blockchain: BlockchainCode;
  gas?: number;
  gasPrice?: string;
  maxGasPrice?: string;
  nonce?: number;
  priorityGasPrice?: string;
  target: number;
  totalBalance?: string;
  totalTokenBalance?: string;
  type: string;
}

export interface EthereumBasicPlainTx extends EthereumPlainTx {
  from?: string;
  to?: string;
  transferFrom?: string;
}

export interface Erc20ApprovePlainTx extends EthereumPlainTx {
  allowFor?: string;
  approveBy?: string;
}

export interface Erc20ConvertPlainTx extends EthereumPlainTx {
  address?: string;
}

export type AnyPlainTx = BitcoinPlainTx | EthereumPlainTx;

const ethereumBasicTxMetaTypes: Readonly<TxMetaType[]> = [
  TxMetaType.ETHER_CANCEL,
  TxMetaType.ETHER_SPEEDUP,
  TxMetaType.ETHER_TRANSFER,
  TxMetaType.ERC20_CANCEL,
  TxMetaType.ERC20_SPEEDUP,
  TxMetaType.ERC20_TRANSFER,
];

export function isBitcoinPlainTx(transaction: AnyPlainTx): transaction is BitcoinPlainTx {
  return isBitcoin(transaction.blockchain);
}

export function isEthereumPlainTx(transaction: AnyPlainTx): transaction is EthereumPlainTx {
  return isEthereum(transaction.blockchain);
}

export function isEthereumBasicPlainTx(transaction: AnyPlainTx): transaction is EthereumBasicPlainTx {
  return ethereumBasicTxMetaTypes.includes(transaction.meta.type);
}

export function isErc20ApprovePlainTx(transaction: AnyPlainTx): transaction is Erc20ApprovePlainTx {
  return transaction.meta.type === TxMetaType.ERC20_APPROVE;
}

export function isErc20ConvertPlainTx(transaction: AnyPlainTx): transaction is Erc20ApprovePlainTx {
  return transaction.meta.type === TxMetaType.ERC20_CONVERT;
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
