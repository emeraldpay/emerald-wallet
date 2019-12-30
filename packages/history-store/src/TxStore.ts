import { convert } from '@emeraldplatform/core';
import { blockchainById, BlockchainCode, IStoredTransaction, utils } from '@emeraldwallet/core';
import BigNumber from 'bignumber.js';
import * as ElectronStore from 'electron-store';

const { toBigNumber } = convert;

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
    return {
      value: (tx.value && typeof tx.value === 'string') ? toBigNumber(tx.value) : new BigNumber(0),
      hash: tx.hash,
      input: tx.input,
      gasPrice: (tx.gasPrice && typeof tx.gasPrice === 'string') ? toBigNumber(tx.gasPrice) : new BigNumber(0),
      gas: tx.gas,
      to: tx.to,
      from: tx.from,
      nonce: tx.nonce,
      data: tx.data,
      blockHash: tx.blockHash,
      blockNumber: tx.blockNumber,
      timestamp: utils.parseDate(tx.timestamp, undefined),
      blockchain: tx.blockchain || (blockchainById(tx.chainId) ? blockchainById(tx.chainId)!.params.code : null),
      chainId: tx.chainId,
      since: utils.parseDate(tx.since, new Date()),
      discarded: tx.discarded || false
    };
  }
}
