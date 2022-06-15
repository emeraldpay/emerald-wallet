import { EstimationMode } from '@emeraldpay/api';
import { AnyCoinCode } from '../Asset';
import { BlockchainCode } from '../blockchains';
import { EthereumRawTransaction } from '../transaction/ethereum';

export default interface IBackendApi {
  broadcastSignedTx(blockchain: BlockchainCode, tx: string): Promise<string>;
  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any>;
  estimateTxCost(blockchain: BlockchainCode, tx: any): Promise<number>;
  getBalance(blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]): Promise<Record<string, string>>;
  getNonce(blockchain: BlockchainCode, address: string): Promise<number>;
  getEthTx(blockchain: BlockchainCode, hash: string): Promise<EthereumRawTransaction | null>;
}
