import { EthereumEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { SelectAsset } from '../../../../../../common/SelectAsset';
import { TransferFlow } from '../../common';
import { EthereumFee } from '../../components';
import { Data, DataProvider, Handler } from '../../types';

type EthereumData = Data<workflow.CreateEtherTx | workflow.CreateErc20Tx, EthereumEntry>;

export class EthereumTransferFlow extends TransferFlow {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
  }

  private renderAsset(): React.ReactElement {
    const { asset, assets, entry, ownerAddress } = this.data;
    const { getBalance, getFiatBalance } = this.dataProvider;
    const { setAsset } = this.handler;

    return (
      <FormRow>
        <FormLabel>Token</FormLabel>
        <SelectAsset
          asset={asset}
          assets={assets.filter(({ balance }) => balance.isPositive())}
          balance={getBalance(entry, asset, ownerAddress)}
          fiatBalance={getFiatBalance(asset)}
          onChangeAsset={setAsset}
        />
      </FormRow>
    );
  }

  private renderFee(): React.ReactElement {
    const {
      createTx,
      fee: { loading, range },
    } = this.data;

    if (!workflow.isEthereumFeeRange(range)) {
      throw new Error('Bitcoin transaction or fee provided for Ethereum transaction');
    }

    const { setTransaction } = this.handler;

    return <EthereumFee createTx={createTx} feeRange={range} initializing={loading} setTransaction={setTransaction} />;
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderFrom()}
        {this.renderAsset()}
        {this.renderTo()}
        {this.renderAmount()}
        {this.renderFee()}
        {this.renderActions()}
      </>
    );
  }
}
