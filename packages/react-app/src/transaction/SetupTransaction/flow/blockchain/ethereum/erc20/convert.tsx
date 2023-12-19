import { EthereumEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { CreateTxStage } from '@emeraldwallet/store';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import * as React from 'react';
import { SelectEntry } from '../../../../../../common/SelectEntry';
import { Actions, Amount, EthereumFee } from '../../../components';
import { CommonFlow, Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ConvertTx, EthereumEntry>;

export class Erc20ConvertFlow implements CommonFlow {
  readonly data: EthereumData;
  readonly dataProvider: DataProvider;
  readonly handler: Handler;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    this.data = data;
    this.dataProvider = dataProvider;
    this.handler = handler;
  }

  private renderDirection(): React.ReactElement {
    const { createTx, fee } = this.data;
    const { setAsset } = this.handler;

    const { coin, coinTicker } = Blockchains[createTx.blockchain].params;

    return (
      <FormRow>
        <FormLabel />
        <ToggleButtonGroup exclusive={true} value={createTx.asset} onChange={(_event, value) => setAsset(value)}>
          <ToggleButton disabled={fee.loading} value={coinTicker}>
            {coin} to {createTx.token.symbol}
          </ToggleButton>
          <ToggleButton disabled={fee.loading} value={createTx.token.address}>
            {createTx.token.symbol} to {coin}
          </ToggleButton>
        </ToggleButtonGroup>
      </FormRow>
    );
  }

  private renderFrom(): React.ReactElement {
    const { entries, ownerAddress, tokenRegistry } = this.data;
    const { getBalance } = this.dataProvider;
    const { setEntry } = this.handler;

    const convertEntries = entries
      .filter((item): item is EthereumEntry => isEthereumEntry(item))
      .filter((item) => {
        const blockchain = blockchainIdToCode(item.blockchain);

        return (
          tokenRegistry.hasWrappedToken(blockchain) &&
          getBalance(item, Blockchains[blockchain].params.coinTicker).isPositive()
        );
      });

    let { entry } = this.data;

    if (!convertEntries.some(({ id }) => id === entry.id)) {
      [entry] = convertEntries;
    }

    return (
      <FormRow>
        <FormLabel>From</FormLabel>
        <SelectEntry entries={convertEntries} ownerAddress={ownerAddress} selectedEntry={entry} onSelect={setEntry} />
      </FormRow>
    );
  }

  private renderAmount(): React.ReactElement {
    const { createTx, fee } = this.data;
    const { setTransaction } = this.handler;

    return <Amount createTx={createTx} maxDisabled={fee.loading} setTransaction={setTransaction} />;
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
        {this.renderDirection()}
        {this.renderFrom()}
        {this.renderAmount()}
        {this.renderFee()}
        {this.renderActions()}
      </>
    );
  }
}
