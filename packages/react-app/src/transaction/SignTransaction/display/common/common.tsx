import { MAX_DISPLAY_ALLOWANCE, workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { Actions, Amount, Type } from '../components';
import { Data, DataProvider, Handler } from '../types';

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

  renderType(): React.ReactElement {
    const { createTx } = this.data;

    return <Type blockchain={createTx.blockchain} type={createTx.meta.type} />;
  }

  renderAmount(): React.ReactElement {
    const { createTx } = this.data;
    const { getFiatAmount } = this.dataProvider;

    return (
      <FormRow>
        <FormLabel top={2}>Amount</FormLabel>
        <Amount
          amount={createTx.amount}
          fiatAmount={getFiatAmount(createTx.amount)}
          maxDisplay={createTx.meta.type === workflow.TxMetaType.ERC20_APPROVE ? MAX_DISPLAY_ALLOWANCE : undefined}
        />
      </FormRow>
    );
  }

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
