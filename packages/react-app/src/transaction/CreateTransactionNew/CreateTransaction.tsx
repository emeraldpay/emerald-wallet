import { EntryId, Uuid, WalletEntry, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { CreateTxStage, IState, accounts, screen, txStash } from '@emeraldwallet/store';
import { Back, FormLabel, FormRow, Page } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { SelectEntry } from '../../common/SelectEntry';
import { CreateBitcoinTransaction } from './CreateBitcoinTransaction';
import { CreateEthereumTransaction } from './CreateEthereumTransaction';

interface OwnProps {
  entryId?: EntryId;
  walletId: Uuid;
}

interface StateProps {
  entry: WalletEntry;
  entries: WalletEntry[];
  ownerAddress?: string;
  stage: CreateTxStage;
}

interface DispatchProps {
  goBack(): void;
  reset(): void;
  setEntry(entry: WalletEntry, ownerAddress?: string): void;
}

const CreateTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  entry,
  entries,
  ownerAddress,
  stage,
  goBack,
  reset,
  setEntry,
}) => {
  React.useEffect(
    () => {
      return () => {
        reset();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Page leftIcon={<Back onClick={goBack} />} title="Create Transaction">
      {stage === CreateTxStage.SETUP && (
        <FormRow>
          <FormLabel>From</FormLabel>
          <SelectEntry
            withAllowances
            entries={entries}
            ownerAddress={ownerAddress}
            selectedEntry={entry}
            onSelect={setEntry}
          />
        </FormRow>
      )}
      {isBitcoinEntry(entry) ? (
        <CreateBitcoinTransaction entry={entry} onCancel={goBack} />
      ) : (
        <CreateEthereumTransaction entry={entry} ownerAddress={ownerAddress} onCancel={goBack} />
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entryId, walletId }) => {
    const entries = accounts.selectors.findWallet(state, walletId)?.entries.filter((entry) => !entry.receiveDisabled);

    if (entries == null || entries.length === 0) {
      throw new Error('Something went wrong while getting entries from wallet.');
    }

    const txOrigin = txStash.selectors.getEntry(state);

    let { entry } = txOrigin;

    if (entry == null) {
      [entry] = entries;

      if (entryId != null) {
        entry = entries.find(({ id }) => id === entryId) ?? entry;
      }
    }

    return {
      entry,
      entries,
      ownerAddress: txOrigin.ownerAddress,
      stage: txStash.selectors.getStage(state),
    };
  },
  (dispatch) => ({
    goBack() {
      dispatch(screen.actions.goBack());
    },
    reset() {
      dispatch(txStash.actions.reset());
    },
    setEntry(entry, ownerAddress) {
      dispatch(txStash.actions.setEntry(entry, ownerAddress));
    },
  }),
)(CreateTransaction);
