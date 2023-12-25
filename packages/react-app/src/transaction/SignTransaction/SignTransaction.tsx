import { BigAmount } from '@emeraldpay/bigamount';
import { WalletEntry, isSeedPkRef } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, CurrencyAmount, TokenRegistry, workflow } from '@emeraldwallet/core';
import {
  CreateTxStage,
  IState,
  accounts,
  blockchains,
  screen,
  settings,
  transaction,
  txStash,
} from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import { Display } from './display';

interface OwnProps {
  onCancel(): void;
}

interface StateProps {
  createTx: workflow.AnyCreateTx;
  entry: WalletEntry;
  isHardware: boolean;
  getFiatAmount(amount: BigAmount): CurrencyAmount;
}

interface DispatchProps {
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  signTx(createTx: workflow.AnyCreateTx, entry: WalletEntry, password?: string): Promise<void>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const SignTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  createTx,
  entry,
  isHardware,
  getFiatAmount,
  lookupAddress,
  onCancel,
  signTx,
  verifyGlobalKey,
}) => {
  const { display } = new Display(
    { createTx, entry, isHardware },
    { getFiatAmount, lookupAddress },
    { onCancel, signTx, verifyGlobalKey },
  );

  return display.render();
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => {
    const { entry } = txStash.selectors.getEntry(state);

    if (entry == null) {
      throw new Error('Entry not provided');
    }

    const tx = txStash.selectors.getTransaction(state);

    if (tx == null) {
      throw new Error('Transaction not provided');
    }

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const { id: entryId } = entry;

    return {
      entry,
      createTx: workflow.fromPlainTx(
        tx,
        {
          entryId,
          blockchain: tx.blockchain,
          changeAddress: txStash.selectors.getChangeAddress(state),
        },
        tokenRegistry,
      ),
      isHardware:
        isSeedPkRef(entry, entry.key) &&
        accounts.selectors.isHardwareSeed(state, { type: 'id', value: entry.key.seedId }),
      getFiatAmount(amount) {
        const rate = settings.selectors.fiatRate(state, amount) ?? 0;
        const value = amount.getNumberByUnit(amount.units.top).multipliedBy(rate);

        return new CurrencyAmount(value.multipliedBy(100), state.settings.localeCurrency);
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
    async signTx(createTx, entry, password) {
      const txSigner = new workflow.TxSigner(
        { createTx, entry, password },
        {
          getNonce(blockchain, from) {
            return dispatch(transaction.actions.getNonce(blockchain, from));
          },
          getXPubPosition(xpub) {
            return dispatch(accounts.actions.getXPubPosition(xpub));
          },
          listEntryAddresses(entryId, role, start, limit) {
            return dispatch(accounts.actions.listEntryAddresses(entryId, role, start, limit));
          },
        },
        {
          setXPubCurrentIndex(xpub, position) {
            return dispatch(transaction.actions.setXPubCurrentIndex(xpub, position));
          },
          signTx(unsigned, entryId, password) {
            return dispatch(transaction.actions.signTx(unsigned, entryId, password));
          },
        },
      );

      try {
        const signedTx = await txSigner.sign();

        dispatch(txStash.actions.setSigned(signedTx));
        dispatch(txStash.actions.setStage(CreateTxStage.BROADCAST));
      } catch (exception) {
        if (exception instanceof Error) {
          dispatch(screen.actions.showError(exception));
        }
      }
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(SignTransaction);
