import { workflow } from '@emeraldwallet/core';
import * as React from 'react';
import { RawTx } from './components';
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
}
