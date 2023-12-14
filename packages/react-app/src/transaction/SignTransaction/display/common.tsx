import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { Actions } from './components';
import { Data, DataProvider, Handler } from './types';

type CommonData = Data<workflow.AnyCreateTx>;

export abstract class CommonDisplay {
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
    const { createTx, entry, isHardware } = this.data;
    const { onCancel, signTx, verifyGlobalKey } = this.handler;

    const handleSignTx = (password?: string): Promise<void> => signTx(createTx, entry, password);

    return (
      <Actions
        blockchain={createTx.blockchain}
        isHardware={isHardware}
        onCancel={onCancel}
        onSignTx={handleSignTx}
        verifyGlobalKey={verifyGlobalKey}
      />
    );
  }
}
