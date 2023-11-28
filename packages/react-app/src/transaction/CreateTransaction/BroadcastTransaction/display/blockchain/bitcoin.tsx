import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { CommonDisplay } from '../common';
import { Actions, BitcoinDecoded } from '../components';
import { Data, Handler } from '../types';

type BitcoinData = Data<workflow.CreateBitcoinTx>;

export class BitcoinDisplay extends CommonDisplay {
  readonly data: BitcoinData;

  constructor(data: BitcoinData, handler: Handler) {
    super(data, handler);

    this.data = data;
  }

  private renderDecoded(): React.ReactElement {
    const {
      createTx: { blockchain, utxo },
      signed: { raw },
    } = this.data;

    return <BitcoinDecoded blockchain={blockchain} raw={raw} utxo={utxo} />;
  }

  private renderActions(): React.ReactElement {
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

  render(): React.ReactElement {
    return (
      <>
        {this.renderDecoded()}
        {this.renderRawTx()}
        {this.renderActions()}
      </>
    );
  }
}
