import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { CreateTxStage } from '@emeraldwallet/store';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { SelectEntry } from '../../../../../common/SelectEntry';
import { Amount, To } from '../components';
import { Actions } from '../components/Actions';
import { Data, DataProvider, Handler } from '../types';

type CommonData = Data<workflow.AnyCreateTx, WalletEntry>;

export abstract class TransferFlow {
  readonly data: CommonData;
  readonly dataProvider: DataProvider;
  readonly handler: Handler;

  constructor(data: CommonData, dataProvider: DataProvider, handler: Handler) {
    this.data = data;
    this.dataProvider = dataProvider;
    this.handler = handler;
  }

  abstract render(): React.ReactElement;

  renderFrom(): React.ReactNode {
    const { entry, entries, ownerAddress } = this.data;
    const { setEntry } = this.handler;

    return (
      <FormRow>
        <FormLabel>From</FormLabel>
        <SelectEntry
          withAllowances
          entries={entries}
          ownerAddress={ownerAddress}
          selectedEntry={entry}
          onSelect={setEntry}
        />
      </FormRow>
    );
  }

  renderTo(): React.ReactNode {
    const { createTx } = this.data;
    const { setTransaction } = this.handler;

    return <To createTx={createTx} setTransaction={setTransaction} />;
  }

  renderAmount(): React.ReactNode {
    const { createTx, fee } = this.data;
    const { setTransaction } = this.handler;

    return <Amount createTx={createTx} maxDisabled={fee.loading} setTransaction={setTransaction} />;
  }

  renderActions(): React.ReactNode {
    const { createTx, entry, fee } = this.data;
    const { onCancel, setEntry, setStage, setTransaction } = this.handler;

    const handleCreateTx = (): void => {
      setEntry(entry);
      setTransaction(createTx.dump());

      setStage(CreateTxStage.SIGN);
    };

    return <Actions createTx={createTx} initializing={fee.loading} onCancel={onCancel} onCreate={handleCreateTx} />;
  }
}
