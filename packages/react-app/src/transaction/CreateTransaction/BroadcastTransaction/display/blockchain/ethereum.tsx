import { TokenRegistry, workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { CommonDisplay } from '../common';
import { EthereumDecoded } from '../components';
import { Data, Handler } from '../types';

type EthereumData = Data<workflow.AnyEthereumCreateTx>;

export class EthereumDisplay extends CommonDisplay {
  readonly data: EthereumData;
  readonly tokenRegistry: TokenRegistry;

  constructor(data: EthereumData, handler: Handler, tokenRegistry: TokenRegistry) {
    super(data, handler);

    this.data = data;
    this.tokenRegistry = tokenRegistry;
  }

  render(): React.ReactElement {
    const {
      createTx: { blockchain },
      signed: { raw },
    } = this.data;

    return (
      <>
        <EthereumDecoded blockchain={blockchain} raw={raw} tokenRegistry={this.tokenRegistry} />
        {this.renderRawTx()}
        {this.renderActions()}
      </>
    );
  }
}
