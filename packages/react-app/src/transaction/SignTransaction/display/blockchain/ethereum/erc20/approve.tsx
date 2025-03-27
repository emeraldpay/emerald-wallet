import { workflow } from '@emeraldwallet/core';
import { Address, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography } from '@mui/material';
import * as React from 'react';
import { EthereumCommonDisplay } from '../../../common';
import { EthereumName } from '../../../components';
import { Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ApproveTx>;

export class Erc20ApproveDisplay extends EthereumCommonDisplay {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderFrom(): React.ReactElement {
    const { createTx } = this.data;

    const { approveBy: address } = createTx;

    return (
      <FormRow>
        <FormLabel>From</FormLabel>
        {address == null ? <Typography>Unknown address</Typography> : <Address address={address} />}
      </FormRow>
    );
  }

  private renderTo(): React.ReactElement {
    const { createTx } = this.data;
    const { lookupAddress } = this.dataProvider;

    const { blockchain, allowFor: address } = createTx;

    return (
      <>
        <FormRow>
          <FormLabel>To</FormLabel>
          {address == null ? <Typography>Unknown address</Typography> : <Address address={address} />}
        </FormRow>
        {address != null && <EthereumName address={address} blockchain={blockchain} lookupAddress={lookupAddress} />}
      </>
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
