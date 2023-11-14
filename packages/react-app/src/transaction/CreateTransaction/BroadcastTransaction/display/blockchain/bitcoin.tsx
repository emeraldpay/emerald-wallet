import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { CommonDisplay } from '../common';
import { BitcoinDecoded } from '../components';
import { Data, Handler } from '../types';

type BitcoinData = Data<workflow.CreateBitcoinTx>;

export class BitcoinDisplay extends CommonDisplay {
  readonly data: BitcoinData;

  constructor(data: BitcoinData, handler: Handler) {
    super(data, handler);

    this.data = data;
  }

  render(): React.ReactElement {
    const {
      createTx: { blockchain, utxo },
      signed: { raw },
    } = this.data;

    return (
      <>
        <BitcoinDecoded blockchain={blockchain} raw={raw} utxo={utxo} />
        {this.renderRawTx()}
        {this.renderActions()}
      </>
    );
  }
}
