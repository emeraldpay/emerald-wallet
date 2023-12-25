import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { CreateTxStage } from '@emeraldwallet/store';
import * as React from 'react';
import { Actions } from '../components';
import { BaseFlow, Data, DataProvider, Handler } from '../types';

export abstract class CommonFlow implements BaseFlow {
  readonly data: Data<workflow.AnyCreateTx, WalletEntry>;
  readonly dataProvider: DataProvider;
  readonly handler: Handler;

  constructor(data: Data<workflow.AnyCreateTx, WalletEntry>, dataProvider: DataProvider, handler: Handler) {
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
