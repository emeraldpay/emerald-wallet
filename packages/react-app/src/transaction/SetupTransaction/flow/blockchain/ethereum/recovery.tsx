import { EthereumEntry, WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { Blockchains, blockchainIdToCode, formatAmount, workflow } from '@emeraldwallet/core';
import { CreateTxStage } from '@emeraldwallet/store';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { SelectAsset } from '../../../../../common/SelectAsset';
import { SelectEntry } from '../../../../../common/SelectEntry';
import { Actions, EthereumFee } from '../../components';
import { CommonFlow, Data, DataProvider, Handler } from '../../types';

type EthereumData = Data<workflow.CreateEtherRecoveryTx | workflow.CreateErc20RecoveryTx, EthereumEntry>;

export class EthereumRecoveryFlow implements CommonFlow {
  readonly data: EthereumData;
  readonly dataProvider: DataProvider;
  readonly handler: Handler;

  constructor(data: EthereumData, dataProvider: DataProvider, handler: Handler) {
    this.data = data;
    this.dataProvider = dataProvider;
    this.handler = handler;
  }

  private getToEntries(): EthereumEntry[] {
    const { entry, entries } = this.data;

    return entries
      .filter((entry): entry is EthereumEntry => isEthereumEntry(entry))
      .filter(({ blockchain, receiveDisabled }) => !receiveDisabled && blockchain === entry.blockchain);
  }

  private renderTo(entries: EthereumEntry[]): React.ReactElement {
    const { createTx } = this.data;
    const { setTransaction } = this.handler;

    const handleSelectTo = (entry: WalletEntry): void => {
      createTx.to = entry.address?.value;

      setTransaction(createTx.dump());
    };

    const { to: toAddress } = createTx;

    let [entry] = entries;

    if (toAddress != null) {
      entry =
        entries.find(
          ({ address, blockchain }) =>
            address?.value === toAddress && blockchainIdToCode(blockchain) === createTx.blockchain,
        ) ?? entry;
    }

    return (
      <FormRow>
        <FormLabel>To</FormLabel>
        <SelectEntry entries={entries} selectedEntry={entry} onSelect={handleSelectTo} />
      </FormRow>
    );
  }

  private renderToken(): React.ReactNode {
    const { asset, assets, entry } = this.data;
    const { getBalance, getFiatBalance } = this.dataProvider;
    const { setAsset } = this.handler;

    return (
      <FormRow>
        <FormLabel>Token</FormLabel>
        <SelectAsset
          asset={asset}
          assets={assets.filter(({ balance }) => balance.isPositive())}
          balance={getBalance(entry, asset)}
          fiatBalance={getFiatBalance(asset)}
          onChangeAsset={setAsset}
        />
      </FormRow>
    );
  }

  private renderPreview(): React.ReactElement {
    const { entries, entry, createTx } = this.data;

    const wrongEntry = entries.find(
      ({ address, blockchain, receiveDisabled }) =>
        !receiveDisabled &&
        address != null &&
        address.value === entry.address?.value &&
        blockchain !== entry.blockchain,
    );

    const recoveryBlockchain = Blockchains[blockchainIdToCode(entry.blockchain)];
    const wrongBlockchain = wrongEntry == null ? null : Blockchains[blockchainIdToCode(wrongEntry.blockchain)];

    return (
      <>
        <FormRow>
          <FormLabel>Amount</FormLabel>
          <Typography>{formatAmount(createTx.amount)}</Typography>
        </FormRow>
        <FormRow>
          <FormLabel>Reason</FormLabel>
          <Typography>
            {recoveryBlockchain.getTitle()} coins/tokens on {wrongBlockchain?.getTitle() ?? 'wrong'} address
          </Typography>
        </FormRow>
      </>
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
    const { entry } = this.data;

    const toEntries = this.getToEntries();

    if (toEntries.length === 0) {
      const blockchainTitle = Blockchains[blockchainIdToCode(entry.blockchain)].getTitle();

      return (
        <Alert severity="warning">
          Address for recovery not found. Please add new address on {blockchainTitle} blockchain and try again.
        </Alert>
      );
    }

    return (
      <>
        {this.renderTo(toEntries)}
        {this.renderToken()}
        {this.renderPreview()}
        {this.renderFee()}
        {this.renderActions()}
      </>
    );
  }
}
