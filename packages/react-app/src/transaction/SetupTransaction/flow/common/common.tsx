import { EthereumEntry, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { AnyCreateTx } from '@emeraldwallet/core/src/transaction/workflow';
import { CreateTxStage } from '@emeraldwallet/store';
import * as React from 'react';
import { Actions, EthereumFee } from '../components';
import { BaseFlow, Data, DataProvider, Handler } from '../types';

export abstract class CommonFlow implements BaseFlow {
  readonly data: Data<AnyCreateTx, WalletEntry>;
  readonly dataProvider: DataProvider;
  readonly handler: Handler;

  constructor(data: Data<AnyCreateTx, WalletEntry>, dataProvider: DataProvider, handler: Handler) {
    this.data = data;
    this.dataProvider = dataProvider;
    this.handler = handler;
  }

  abstract render(): React.ReactElement;

  renderActions(): React.ReactElement {
    const { createTx, entry, fee } = this.data;
    const { onCancel, setEntry, setStage, setTransaction } = this.handler;

    const handleCreateTx = (): void => {
      setEntry(entry);
      setTransaction(createTx.dump());

      setStage(CreateTxStage.SIGN);
    };

    return <Actions createTx={createTx} initializing={fee.loading} onCancel={onCancel} onCreate={handleCreateTx} />;
  }
}

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

    return <EthereumFee createTx={createTx} feeRange={range} initializing={loading} setTransaction={setTransaction} />;
  }
}
