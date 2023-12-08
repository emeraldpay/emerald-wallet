import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { StoredTxView } from '../../../../../../../common/StoredTxView';
import { ModifyFlow } from '../../../common';
import { BitcoinFee } from '../../../components';
import { Data, DataProvider, Handler } from '../../../types';

type BitcoinData<T extends workflow.AnyBitcoinCreateTx> = Data<T, BitcoinEntry>;

export class BitcoinModifyFlow<T extends workflow.AnyBitcoinCreateTx> extends ModifyFlow {
  readonly data: BitcoinData<T>;

  constructor(data: BitcoinData<T>, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderPreview(): React.ReactNode {
    const { storedTx } = this.data;

    if (storedTx == null) {
      return null;
    }

    return <StoredTxView tx={storedTx} />;
  }

  private renderFee(): React.ReactElement {
    const { createTx, transactionFee } = this.data;

    if (!workflow.isBitcoinFeeRange(transactionFee)) {
      throw new Error('Ethereum transaction or fee provided for Bitcoin transaction');
    }

    const { setTransaction } = this.handler;

    return <BitcoinFee createTx={createTx} feeRange={transactionFee} setTransaction={setTransaction} />;
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderPreview()}
        {this.renderFee()}
        {this.renderActions()}
      </>
    );
  }
}
