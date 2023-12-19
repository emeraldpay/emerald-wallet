import { EthereumEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { CreateTxStage } from '@emeraldwallet/store';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { SelectAsset } from '../../../../../../common/SelectAsset';
import { SelectEntry } from '../../../../../../common/SelectEntry';
import { ToField } from '../../../../../../common/ToField';
import { Actions, ApproveAmount, EthereumFee } from '../../../components';
import { CommonFlow, Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ApproveTx, EthereumEntry>;

export class Erc20ApproveFlow implements CommonFlow {
  readonly data: EthereumData;
  readonly dataProvider: DataProvider;
  readonly handler: Handler;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    this.data = data;
    this.dataProvider = dataProvider;
    this.handler = handler;
  }

  private renderFrom(): React.ReactNode {
    const { entries, tokenRegistry } = this.data;
    const { getBalance } = this.dataProvider;
    const { setEntry } = this.handler;

    const approvingEntries = entries
      .filter((entry): entry is EthereumEntry => isEthereumEntry(entry))
      .filter((entry) => {
        const blockchain = blockchainIdToCode(entry.blockchain);

        return (
          !entry.receiveDisabled &&
          tokenRegistry.hasAnyToken(blockchain) &&
          getBalance(entry, Blockchains[blockchain].params.coinTicker).isPositive()
        );
      });

    let { entry } = this.data;

    if (!approvingEntries.some(({ id }) => id === entry.id)) {
      [entry] = approvingEntries;
    }

    return (
      <FormRow>
        <FormLabel>From</FormLabel>
        <SelectEntry entries={approvingEntries} selectedEntry={entry} onSelect={setEntry} />
      </FormRow>
    );
  }

  private renderAsset(): React.ReactElement {
    const { asset, assets, entry } = this.data;
    const { getBalance, getFiatBalance } = this.dataProvider;
    const { setAsset } = this.handler;

    return (
      <FormRow>
        <FormLabel>Token</FormLabel>
        <SelectAsset
          asset={asset}
          assets={assets.filter(({ address }) => address != null)}
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

  private renderActions(): React.ReactElement {
    const { createTx, entry, fee } = this.data;
    const { onCancel, setEntry, setStage, setTransaction } = this.handler;

    const handleCreateTx = (): void => {
      setEntry(entry);
      setTransaction(createTx.dump());

      setStage(CreateTxStage.SIGN);
    };

    return <Actions createTx={createTx} initializing={fee.loading} onCancel={onCancel} onCreate={handleCreateTx} />;
  }

  render(): React.ReactElement {
    return (
      <>
        {this.renderFrom()}
        {this.renderAsset()}
        {this.renderSpender()}
        {this.renderAmount()}
        {this.renderFee()}
        {this.renderActions()}
      </>
    );
  }
}
