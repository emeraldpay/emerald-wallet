import {BlockchainCode} from '../blockchains';
import {AnyCoinCode} from "../Asset";

export default interface IBackendApi {

  getBalance: (blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => Promise<Record<string, string>>;
  // Transactions History
  persistTransactions: (blockchain: BlockchainCode, txs: any[]) => Promise<void>;
  getGasPrice: (blockchain: BlockchainCode) => Promise<number>;
  broadcastSignedTx: (blockchain: BlockchainCode, tx: any) => Promise<string>;
  estimateTxCost: (blockchain: BlockchainCode, tx: any) => Promise<number>;

}
