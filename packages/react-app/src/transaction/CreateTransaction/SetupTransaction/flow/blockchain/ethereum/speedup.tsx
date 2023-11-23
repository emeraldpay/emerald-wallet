import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { SpeedUpFlow } from '../../common';
import { Data, DataProvider, Handler } from '../../types';

type EthereumData = Data<workflow.CreateEthereumSpeedUpTx | workflow.CreateErc20SpeedUpTx, EthereumEntry>;

export class EthereumSpeedUpFlow extends SpeedUpFlow {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  render(): React.ReactElement {
    return <>{this.renderActions()}</>;
  }
}
