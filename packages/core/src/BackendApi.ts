import { address as AddressApi, AddressBalance, AnyAsset, EstimationMode } from '@emeraldpay/api';
import { BlockchainCode } from './blockchains';
import { BitcoinRawTransaction } from './transaction/bitcoin';
import { EthereumBasicTransaction, EthereumRawReceipt, EthereumRawTransaction } from './transaction/ethereum';

export interface BackendApi {
  broadcastSignedTx(blockchain: BlockchainCode, tx: string): Promise<string>;
  describeAddress(blockchain: BlockchainCode, address: string): Promise<AddressApi.DescribeResponse>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any>;
  estimateTxCost(blockchain: BlockchainCode, tx: EthereumBasicTransaction): Promise<number>;
  getBalance(address: string, asset: AnyAsset, includeUtxo?: boolean): Promise<AddressBalance[]>;
  getBtcTx(blockchain: BlockchainCode, hash: string): Promise<BitcoinRawTransaction | null>;
  getEthReceipt(blockchain: BlockchainCode, hash: string): Promise<EthereumRawReceipt | null>;
  getEthTx(blockchain: BlockchainCode, hash: string): Promise<EthereumRawTransaction | null>;
  getNonce(blockchain: BlockchainCode, address: string): Promise<number>;
  getXPubLastIndex(blockchain: BlockchainCode, xpub: string, start: number): Promise<number | undefined>;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  resolveName(blockchain: BlockchainCode, name: string): Promise<string | null>;
}
