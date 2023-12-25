import { workflow } from '@emeraldwallet/core';
import { Address, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import * as React from 'react';
import { EthereumCommonDisplay } from '../../../common';
import { Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ConvertTx>;

export class Erc20ConvertDisplay extends EthereumCommonDisplay {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderFrom(): React.ReactElement {
    const { createTx } = this.data;

    const { address } = createTx;

    return (
      <FormRow>
        <FormLabel>From</FormLabel>
        {address == null ? <Typography>Unknown address</Typography> : <Address address={address} />}
      </FormRow>
    );
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderType()}
        {this.renderFrom()}
        {this.renderAmount()}
        {this.renderFees()}
        {this.renderActions()}
      </>
    );
  }
}
