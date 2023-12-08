import { BigAmount } from '@emeraldpay/bigamount';
import { TokenAmount, TokenRegistry, workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { CommonDisplay } from '../common';
import { Actions, EthereumDecoded } from '../components';
import { Data, Handler } from '../types';

type EthereumData = Data<workflow.AnyEthereumCreateTx | workflow.AnyErc20CreateTx>;

export class EthereumDisplay extends CommonDisplay {
  readonly data: EthereumData;
  readonly tokenRegistry: TokenRegistry;

  constructor(data: EthereumData, handler: Handler, tokenRegistry: TokenRegistry) {
    super(data, handler);

    this.data = data;
    this.tokenRegistry = tokenRegistry;
  }

  private renderDecoded(): React.ReactElement {
    const {
      createTx: { blockchain },
      signed: { raw },
    } = this.data;

    return <EthereumDecoded blockchain={blockchain} raw={raw} tokenRegistry={this.tokenRegistry} />;
  }

  private renderActions(): React.ReactElement {
    const {
      createTx,
      entry: { id: entryId },
      signed: { raw: signed, txid: txId },
    } = this.data;
    const { broadcastTx, onCancel } = this.handler;

    let originalAmount: BigAmount | undefined;
    let tokenAmount: TokenAmount | undefined;

    if (workflow.isAnyErc20CreateTx(createTx)) {
      tokenAmount = this.tokenRegistry.byAddress(createTx.blockchain, createTx.asset).getAmount(createTx.amount.number);
    } else {
      originalAmount = createTx.amount;
    }

    const handleBroadcastTx = (): Promise<void> =>
      broadcastTx({
        entryId,
        originalAmount,
        signed,
        tokenAmount,
        txId,
        blockchain: createTx.blockchain,
        fee: createTx.getFees(),
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
