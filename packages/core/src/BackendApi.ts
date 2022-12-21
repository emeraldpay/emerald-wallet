import { EstimationMode } from '@emeraldpay/api';
import { BlockchainCode } from './blockchains';
import { EthereumBasicTransaction, EthereumRawReceipt, EthereumRawTransaction } from './transaction/ethereum';

export interface BackendApi {
  broadcastSignedTx(blockchain: BlockchainCode, tx: string): Promise<string>;
  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any>;
  estimateTxCost(blockchain: BlockchainCode, tx: EthereumBasicTransaction): Promise<number>;
  getBalance(blockchain: BlockchainCode, address: string, tokens: string[]): Promise<Record<string, string>>;
  getNonce(blockchain: BlockchainCode, address: string): Promise<number>;
  getEthReceipt(blockchain: BlockchainCode, hash: string): Promise<EthereumRawReceipt | null>;
  getEthTx(blockchain: BlockchainCode, hash: string): Promise<EthereumRawTransaction | null>;
  getXPubLastIndex(blockchain: BlockchainCode, xpub: string, start: number): Promise<number | undefined>;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  resolveName(blockchain: BlockchainCode, name: string): Promise<string | null>;
}
