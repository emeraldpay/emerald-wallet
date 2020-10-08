import {blockchainById, BlockchainCode, isBitcoin, IStoredTransaction, utils} from '@emeraldwallet/core';
import * as ElectronStore from 'electron-store';

interface IStoreType {
  transactions: IStoredTransaction[];
}

export default class TxStore {
  private store: ElectronStore<IStoreType>;
  constructor (walletId: string, network: BlockchainCode) {
    this.store = new ElectronStore({
      cwd: walletId,
      name: `${network}-transactions`
    });
  }

  public save (transactions: IStoredTransaction[]) {
    this.store.set('transactions', transactions);
  }

  public load (): IStoredTransaction[] {
    return this.store.get('transactions', []).map(this.restoreTx);
  }

  public getFilePath () {
    return this.store.path;
  }

  /**
   * Converts parsed JSON object to typed Transaction object
   */
  private restoreTx (tx: any): IStoredTransaction {
    const blockchain = tx.blockchain as BlockchainCode;
    if (isBitcoin(blockchain)) {
      return {
        timestamp: utils.parseDate(tx.timestamp, undefined),
        since: utils.parseDate(tx.since, new Date()),
        discarded: tx.discarded || false,
        inputs: tx.inputs || [],
        outputs: tx.outputs || [],
        ...tx
      }
    } else {
      return {
        timestamp: utils.parseDate(tx.timestamp, undefined),
        since: utils.parseDate(tx.since, new Date()),
        discarded: tx.discarded || false,
        ...tx
      };
    }
  }
}
