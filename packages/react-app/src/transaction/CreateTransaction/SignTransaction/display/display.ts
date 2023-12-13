import { workflow } from '@emeraldwallet/core';
import { BitcoinDisplay, Erc20ApproveDisplay, Erc20ConvertDisplay, EthereumDisplay } from './blockchain';
import { BlockchainDisplay, Data, DataProvider, Handler } from './types';

export class Display {
  private readonly _display: BlockchainDisplay;

  constructor(data: Data<workflow.AnyCreateTx>, dataProvider: DataProvider, handler: Handler) {
    const { createTx } = data;

    if (workflow.isAnyBitcoinCreateTx(createTx)) {
      this._display = new BitcoinDisplay({ ...data, createTx }, dataProvider, handler);
    } else {
      if (workflow.isErc20ApproveCreateTx(createTx)) {
        this._display = new Erc20ApproveDisplay({ ...data, createTx }, dataProvider, handler);
      } else if (workflow.isErc20ConvertCreateTx(createTx)) {
        this._display = new Erc20ConvertDisplay({ ...data, createTx }, dataProvider, handler);
      } else {
        this._display = new EthereumDisplay({ ...data, createTx }, dataProvider, handler);
      }
    }
  }

  get display(): BlockchainDisplay {
    return this._display;
  }
}
