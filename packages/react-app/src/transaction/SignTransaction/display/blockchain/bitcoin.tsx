import { amountFactory, formatAmount, workflow } from '@emeraldwallet/core';
import { Address, BlockchainAvatar } from '@emeraldwallet/ui';
import { Box, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { CommonDisplay } from '../common';
import { Data, DataProvider, Handler } from '../types';

type BitcoinData = Data<workflow.CreateBitcoinTx>;

export class BitcoinDisplay extends CommonDisplay {
  readonly data: BitcoinData;

  constructor(data: BitcoinData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderPreview(): React.ReactElement {
    const {
      blockchain,
      outputs: [{ amount, address }],
    } = this.data.createTx;

    return (
      <Box mb={2}>
        <Grid container alignItems="center">
          <Grid item>
            <Box pr={2}>
              <BlockchainAvatar blockchain={blockchain} />
            </Box>
          </Grid>
          <Grid item>
            <Typography variant="h5">Sending {formatAmount(amountFactory(blockchain)(amount))} to:</Typography>
            <Address address={address} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderPreview()}
        {this.renderActions()}
      </>
    );
  }
}
