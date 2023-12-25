import { workflow } from '@emeraldwallet/core';
import { Address, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import * as React from 'react';
import { CommonDisplay } from '../common';
import { BitcoinAddresses } from '../components';
import { Data, DataProvider, Handler } from '../types';

type BitcoinData = Data<workflow.CreateBitcoinTx>;

export class BitcoinDisplay extends CommonDisplay {
  readonly data: BitcoinData;

  constructor(data: BitcoinData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderFrom(): React.ReactElement {
    const { createTx } = this.data;

    return <BitcoinAddresses inputs={createTx.build().inputs} />;
  }

  private renderTo(): React.ReactElement {
    const { createTx } = this.data;

    const { to: address } = createTx.tx;

    return (
      <FormRow>
        <FormLabel>To</FormLabel>
        {address == null ? <Typography>Unknown address</Typography> : <Address address={address} />}
      </FormRow>
    );
  }

  private renderFees(): React.ReactElement {
    return (
      <FormRow>
        <FormLabel />
        {/* TODO */}
      </FormRow>
    );
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderType()}
        {this.renderFrom()}
        {this.renderTo()}
        {this.renderAmount()}
        {this.renderFees()}
        {this.renderActions()}
      </>
    );
  }
}
