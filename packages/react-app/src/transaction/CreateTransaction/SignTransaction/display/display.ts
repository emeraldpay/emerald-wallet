import { workflow } from '@emeraldwallet/core';
import { BitcoinDisplay, EthereumDisplay } from './blockchain';
import { BlockchainDisplay, Data, DataProvider, Handler } from './types';

export class Display {
  private readonly _display: BlockchainDisplay;

  constructor(data: Data<workflow.AnyCreateTx>, dataProvider: DataProvider, handler: Handler) {
    const { createTx } = data;

    if (workflow.isBitcoinCreateTx(createTx)) {
      this._display = new BitcoinDisplay({ ...data, createTx }, dataProvider, handler);
    } else {
      this._display = new EthereumDisplay({ ...data, createTx }, dataProvider, handler);
    }
  }

  get display(): BlockchainDisplay {
    return this._display;
  }
}
