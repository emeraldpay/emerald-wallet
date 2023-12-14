import { formatAmount, workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import * as React from 'react';
import { CommonDisplay } from '../../../common';
import { Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ConvertTx>;

export class Erc20ConvertDisplay extends CommonDisplay {
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
          Convert {formatAmount(createTx.amount, 6)} with fee {formatAmount(createTx.getFees(), 6)}
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
