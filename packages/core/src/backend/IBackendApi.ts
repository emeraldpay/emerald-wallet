import { EstimationMode } from '@emeraldpay/api';
import { AnyCoinCode } from '../Asset';
import { BlockchainCode } from '../blockchains';

export default interface IBackendApi {
  broadcastSignedTx(blockchain: BlockchainCode, tx: string): Promise<string>;
  estimateFee(blockchain: BlockchainCode, blocks: number, mode: EstimationMode): Promise<any>;
  estimateTxCost(blockchain: BlockchainCode, tx: any): Promise<number>;
  getBalance(blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]): Promise<Record<string, string>>;
  getNonce(blockchain: BlockchainCode, address: string): Promise<number>;
}
