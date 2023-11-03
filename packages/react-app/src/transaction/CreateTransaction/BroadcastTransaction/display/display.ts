import { TokenRegistry, workflow } from '@emeraldwallet/core';
import { BitcoinDisplay, EthereumDisplay } from './blockchain';
import { BlockchainDisplay, Data, Handler } from './types';

export class Display {
  private readonly _display: BlockchainDisplay;

  constructor({ createTx, ...data }: Data<workflow.AnyCreateTx>, handler: Handler, tokenRegistry: TokenRegistry) {
    if (workflow.isBitcoinCreateTx(createTx)) {
      this._display = new BitcoinDisplay({ ...data, createTx }, handler);
    } else {
      this._display = new EthereumDisplay({ ...data, createTx }, handler, tokenRegistry);
    }
  }

  get display(): BlockchainDisplay {
    return this._display;
  }
}
