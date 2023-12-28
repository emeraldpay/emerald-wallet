import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { TransferFlow } from '../../common';
import { BitcoinFee } from '../../components';
import { Data, DataProvider, Handler } from '../../types';

type BitcoinData = Data<workflow.CreateBitcoinTx, BitcoinEntry>;

export class BitcoinTransferFlow extends TransferFlow {
  readonly data: BitcoinData;

  constructor(data: BitcoinData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderFee(): React.ReactElement {
    const {
      createTx,
      fee: { loading, range },
    } = this.data;

    if (!workflow.isBitcoinFeeRange(range)) {
      throw new Error('Ethereum transaction or fee provided for Bitcoin transaction');
    }

    const { setTransaction } = this.handler;

    return <BitcoinFee createTx={createTx} feeRange={range} initializing={loading} setTransaction={setTransaction} />;
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderFrom()}
        {this.renderTo()}
        {this.renderAmount()}
        {this.renderValidation()}
        {this.renderFee()}
        {this.renderActions()}
      </>
    );
  }
}
