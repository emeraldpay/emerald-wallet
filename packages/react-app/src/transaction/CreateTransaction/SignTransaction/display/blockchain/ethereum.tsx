import { formatAmount, workflow } from '@emeraldwallet/core';
import { ArrowRight } from '@emeraldwallet/ui';
import { Box, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { CommonDisplay } from '../common';
import { AddressPreview } from '../components';
import { Data, DataProvider, Handler } from '../types';

type EthereumData = Data<workflow.AnyEthereumCreateTx>;

export class EthereumDisplay extends CommonDisplay {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  render(): React.ReactElement {
    const { createTx } = this.data;
    const { lookupAddress } = this.dataProvider;

    const { amount, blockchain, from, to } = createTx;

    return (
      <>
        <Grid container justifyContent="space-between">
          <AddressPreview address={from} blockchain={blockchain} lookupAddress={lookupAddress} />
          <Box>
            <Grid container alignItems="center" direction="column" justifyContent="space-between">
              <Typography>{formatAmount(amount)}</Typography>
              <ArrowRight />
            </Grid>
          </Box>
          <AddressPreview address={to} blockchain={blockchain} lookupAddress={lookupAddress} />
        </Grid>
        <Box mt={1} mb={2}>
          <Grid container justifyContent="center">
            <Typography variant="body2">
              Plus {formatAmount(createTx.getFees())} for {createTx.gas} Gas
            </Typography>
          </Grid>
        </Box>
        {this.renderActions()}
      </>
    );
  }
}
