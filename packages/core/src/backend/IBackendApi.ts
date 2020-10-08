import {BlockchainCode} from '../blockchains';
import {AnyCoinCode} from "../Asset";
import {IStoredTransaction} from '..';

export default interface IBackendApi {

  getBalance: (blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => Promise<Record<string, string>>;
  // Transactions History
  persistTransactions: (blockchain: BlockchainCode, txs: IStoredTransaction[]) => Promise<void>;
  getGasPrice: (blockchain: BlockchainCode) => Promise<number>;
  broadcastSignedTx: (blockchain: BlockchainCode, tx: string) => Promise<string>;
  estimateTxCost: (blockchain: BlockchainCode, tx: any) => Promise<number>;

}
