import { WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { BitcoinTransferFlow, EthereumTransferFlow } from './blockchain';
import { BlockchainFlow, Data, DataProvider, Handler } from './types';

export class Flow {
  private readonly _flow: BlockchainFlow;

  constructor(data: Data<workflow.AnyCreateTx, WalletEntry>, dataProvider: DataProvider, handler: Handler) {
    const { entry, createTx } = data;

    if (isBitcoinEntry(entry)) {
      if (workflow.isBitcoinCreateTx(createTx)) {
        this._flow = new BitcoinTransferFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else {
        throw new Error('Unsupported Bitcoin transaction provided');
      }
    } else if (isEthereumEntry(entry)) {
      if (workflow.isAnyEthereumCreateTx(createTx, data.tokenRegistry)) {
        this._flow = new EthereumTransferFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else {
        throw new Error('Unsupported Ethereum transaction provided');
      }
    } else {
      throw new Error('Unsupported entry provided');
    }
  }

  get flow(): BlockchainFlow {
    return this._flow;
  }
}
