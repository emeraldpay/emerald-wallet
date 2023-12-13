import { MAX_DISPLAY_ALLOWANCE, formatAmount, workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import * as React from 'react';
import { CommonDisplay } from '../../../common';
import { Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ApproveTx>;

export class Erc20ApproveDisplay extends CommonDisplay {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderPreview(): React.ReactElement {
    const { createTx } = this.data;

    return (
      <FormRow>
        <FormLabel />
        <Typography>
          Allow {createTx.allowFor} to use{' '}
          {createTx.amount.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE) ? (
            <>&infin; {createTx.amount.getOptimalUnit().code}</>
          ) : (
            formatAmount(createTx.amount, 6)
          )}
          , transaction fee {formatAmount(createTx.getFees(), 6)}
        </Typography>
      </FormRow>
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
