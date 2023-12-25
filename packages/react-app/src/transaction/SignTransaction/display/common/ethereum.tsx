import { workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { Amount } from '../components';
import { Data, DataProvider, Handler } from '../types';
import { CommonDisplay } from './common';

type EthereumData = Data<workflow.AnyEthereumCreateTx>;

export abstract class EthereumCommonDisplay extends CommonDisplay {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  abstract render(): React.ReactElement;

  renderFees(): React.ReactElement {
    const { createTx } = this.data;
    const { getFiatAmount } = this.dataProvider;

    const fees = createTx.getFees();

    return (
      <FormRow>
        <FormLabel top={2}>Fee</FormLabel>
        <Amount amount={fees} fiatAmount={getFiatAmount(fees)} />
      </FormRow>
    );
  }
}
