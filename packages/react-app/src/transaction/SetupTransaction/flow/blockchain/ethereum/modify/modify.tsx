import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { StoredTxView } from '../../../../../../common/StoredTxView';
import { ModifyFlow } from '../../../common';
import { EthereumSettingsPanel } from '../../../components';
import { Data, DataProvider, Handler } from '../../../types';

type EthereumData<T extends workflow.AnyEthereumCreateTx> = Data<T, EthereumEntry>;

export class EthereumModifyFlow<T extends workflow.AnyEthereumCreateTx> extends ModifyFlow {
  readonly data: EthereumData<T>;

  constructor(data: EthereumData<T>, dataProvider: DataProvider, handler: Handler) {
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

    if (!workflow.isEthereumFeeRange(transactionFee)) {
      throw new Error('Bitcoin transaction or fee provided for Ethereum transaction');
    }

    const { setTransaction } = this.handler;

    return <EthereumSettingsPanel createTx={createTx} feeRange={transactionFee} setTransaction={setTransaction} />;
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
