import { EstimationMode } from '@emeraldpay/api';
import { AnyCoinCode } from '../Asset';
import { BlockchainCode } from '../blockchains';
import { EthereumRawReceipt, EthereumRawTransaction } from '../transaction/ethereum';

export default interface IBackendApi {
  broadcastSignedTx(blockchain: BlockchainCode, tx: string): Promise<string>;
  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any>;
  estimateTxCost(blockchain: BlockchainCode, tx: any): Promise<number>;
  getBalance(blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]): Promise<Record<string, string>>;
  getNonce(blockchain: BlockchainCode, address: string): Promise<number>;
  getEthReceipt(blockchain: BlockchainCode, hash: string): Promise<EthereumRawReceipt | null>;
  getEthTx(blockchain: BlockchainCode, hash: string): Promise<EthereumRawTransaction | null>;
  getXPubLastIndex(blockchain: BlockchainCode, xpub: string, start: number): Promise<number | undefined>;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  resolveName(blockchain: BlockchainCode, name: string): Promise<string | null>;
}
