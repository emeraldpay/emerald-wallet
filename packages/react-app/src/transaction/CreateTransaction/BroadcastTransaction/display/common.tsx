import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { RawTx } from './components';
import { Actions } from './components/Actions';
import { Data, Handler } from './types';

type CommonData = Data<workflow.AnyCreateTx>;

export abstract class CommonDisplay {
  readonly data: CommonData;
  readonly handler: Handler;

  constructor(data: CommonData, handler: Handler) {
    this.data = data;
    this.handler = handler;
  }

  abstract render(): React.ReactElement;

  renderRawTx(): React.ReactElement {
    const { raw } = this.data.signed;

    return <RawTx raw={raw} />;
  }

  renderActions(): React.ReactElement {
    const {
      createTx,
      entry: { id: entryId },
      signed: { raw: signed, txid: txId },
    } = this.data;
    const { broadcastTx, onCancel } = this.handler;

    const handleBroadcastTx = (): Promise<void> =>
      broadcastTx({
        entryId,
        signed,
        txId,
        blockchain: createTx.blockchain,
        fee: createTx.getFees(),
        originalAmount: createTx.amount,
        tx: createTx.build(),
      });

    return <Actions onBroadcast={handleBroadcastTx} onCancel={onCancel} />;
  }
}
