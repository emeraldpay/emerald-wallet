import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { SelectAsset } from '../../../../../../common/SelectAsset';
import { SelectEntry } from '../../../../../../common/SelectEntry';
import { ToField } from '../../../../../../common/ToField';
import { EthereumCommonFlow } from '../../../common';
import { ApproveAmount } from '../../../components';
import { Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ApproveTx, EthereumEntry>;

export class Erc20ApproveFlow extends EthereumCommonFlow {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderFrom(): React.ReactElement {
    const { entry, entries } = this.data;
    const { setEntry } = this.handler;

    return (
      <FormRow>
        <FormLabel>From</FormLabel>
        <SelectEntry entries={entries} selectedEntry={entry} onSelect={setEntry} />
      </FormRow>
    );
  }

  private renderToken(): React.ReactElement {
    const { asset, assets, entry } = this.data;
    const { getBalance, getFiatBalance } = this.dataProvider;
    const { setAsset } = this.handler;

    return (
      <FormRow>
        <FormLabel>Token</FormLabel>
        <SelectAsset
          asset={asset}
          assets={assets}
          balance={getBalance(entry, asset)}
          fiatBalance={getFiatBalance(asset)}
          onChangeAsset={setAsset}
        />
      </FormRow>
    );
  }

  private renderSpender(): React.ReactElement {
    const { allowance, createTx } = this.data;
    const { setTransaction } = this.handler;

    const handleToChange = (to: string): void => {
      createTx.allowFor = to;

      setTransaction(createTx.dump());
    };

    return (
      <FormRow>
        <FormLabel>Spender</FormLabel>
        <ToField
          blockchain={createTx.blockchain}
          disabled={allowance != null}
          to={createTx.allowFor}
          onChange={handleToChange}
        />
      </FormRow>
    );
  }

  private renderAmount(): React.ReactElement {
    const { createTx } = this.data;
    const { setTransaction } = this.handler;

    return <ApproveAmount createTx={createTx} setTransaction={setTransaction} />;
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderFrom()}
        {this.renderToken()}
        {this.renderSpender()}
        {this.renderAmount()}
        {this.renderValidation()}
        {this.renderFee()}
        {this.renderActions()}
      </>
    );
  }
}
