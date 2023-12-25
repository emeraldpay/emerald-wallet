import { EthereumEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import * as React from 'react';
import { SelectEntry } from '../../../../../../common/SelectEntry';
import { EthereumCommonFlow } from '../../../common';
import { Amount } from '../../../components';
import { Data, DataProvider, Handler } from '../../../types';

type EthereumData = Data<workflow.CreateErc20ConvertTx, EthereumEntry>;

export class Erc20ConvertFlow extends EthereumCommonFlow {
  readonly data: EthereumData;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    super(data, dataProvider, handler);

    this.data = data;
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
      .filter((entry): entry is EthereumEntry => isEthereumEntry(entry))
      .filter((entry) => {
        const blockchain = blockchainIdToCode(entry.blockchain);

        return (
          !entry.receiveDisabled &&
          tokenRegistry.hasWrappedToken(blockchain) &&
          getBalance(entry, Blockchains[blockchain].params.coinTicker).isPositive()
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
