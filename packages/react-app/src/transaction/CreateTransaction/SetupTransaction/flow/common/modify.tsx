import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { PersistentState, workflow } from '@emeraldwallet/core';
import { CreateTxStage } from '@emeraldwallet/store';
import * as React from 'react';
import { Actions } from '../components';
import { CommonFlow, Data, DataProvider, Handler } from '../types';

type CommonData = Data<workflow.AnyCreateTx, WalletEntry>;

export abstract class ModifyFlow implements CommonFlow {
  readonly data: CommonData;
  readonly dataProvider: DataProvider;
  readonly handler: Handler;

  constructor(data: CommonData, dataProvider: DataProvider, handler: Handler) {
    this.data = data;
    this.dataProvider = dataProvider;
    this.handler = handler;
  }

  abstract render(): React.ReactElement;

  renderActions(): React.ReactElement {
    const { createTx, entry, fee, storedTx } = this.data;
    const { onCancel, setEntry, setStage, setTransaction } = this.handler;

    const handleCreateTx = (): void => {
      setEntry(entry);
      setTransaction(createTx.dump());

      setStage(CreateTxStage.SIGN);
    };

    return (
      <Actions
        createTx={createTx}
        disabled={(storedTx?.state ?? 0) > PersistentState.State.SUBMITTED}
        initializing={fee.loading}
        onCancel={onCancel}
        onCreate={handleCreateTx}
      />
    );
  }
}
