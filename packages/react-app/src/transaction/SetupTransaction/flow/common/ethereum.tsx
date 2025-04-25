import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { Data, DataProvider, Handler } from '../types';
import { CommonFlow } from './common';
import { SettingsPanel } from '../blockchain/ethereum/SettingsPanel';

type EthereumData = Data<workflow.AnyEthereumCreateTx, EthereumEntry>;

export abstract class EthereumCommonFlow extends CommonFlow {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  renderFee(): React.ReactElement {
    const {
      createTx,
      fee: { loading, range },
    } = this.data;

    if (!workflow.isEthereumFeeRange(range)) {
      throw new Error('Bitcoin transaction or fee provided for Ethereum transaction');
    }

    const { setTransaction } = this.handler;

    return <SettingsPanel createTx={createTx} feeRange={range} initializing={loading} setTransaction={setTransaction} />;
  }
}
