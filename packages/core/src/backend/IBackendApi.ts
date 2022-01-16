import { EstimationMode } from '@emeraldpay/api';
import { IStoredTransaction } from '..';
import { AnyCoinCode } from '../Asset';
import { BlockchainCode } from '../blockchains';

export default interface IBackendApi {
  getBalance: (blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => Promise<Record<string, string>>;
  // Transactions History
  persistTransactions: (blockchain: BlockchainCode, txs: IStoredTransaction[]) => Promise<void>;
  getGasPrice: (blockchain: BlockchainCode) => Promise<number>;
  broadcastSignedTx: (blockchain: BlockchainCode, tx: string) => Promise<string>;
  estimateTxCost: (blockchain: BlockchainCode, tx: any) => Promise<number>;
  getNonce: (blockchain: BlockchainCode, address: string) => Promise<number>;
  estimateFee: (blockchain: BlockchainCode, blocks: number, mode: EstimationMode) => Promise<any>;
}
