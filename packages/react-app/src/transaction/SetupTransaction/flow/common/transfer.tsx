import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { SelectEntry } from '../../../../common/SelectEntry';
import { Amount, To } from '../components';
import { Data, DataProvider, Handler } from '../types';
import { CommonFlow } from './common';

type CommonData = Data<workflow.AnyBitcoinCreateTx | workflow.CreateEtherTx | workflow.CreateErc20Tx, WalletEntry>;

export abstract class TransferFlow extends CommonFlow {
  readonly data: CommonData;

  constructor(data: CommonData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  abstract render(): React.ReactElement;

  renderFrom(): React.ReactElement {
    const { entry, entries, ownerAddress } = this.data;
    const { setEntry } = this.handler;

    return (
      <FormRow>
        <FormLabel>From</FormLabel>
        <SelectEntry
          withAllowances
          entries={entries.filter((entry) => !entry.receiveDisabled)}
          ownerAddress={ownerAddress}
          selectedEntry={entry}
          onSelect={setEntry}
        />
      </FormRow>
    );
  }

  renderTo(): React.ReactElement {
    const { createTx } = this.data;
    const { setTransaction } = this.handler;

    return <To createTx={createTx} setTransaction={setTransaction} />;
  }

  renderAmount(): React.ReactElement {
    const { createTx, fee } = this.data;
    const { setTransaction } = this.handler;

    return <Amount createTx={createTx} maxDisabled={fee.loading} setTransaction={setTransaction} />;
  }
}
