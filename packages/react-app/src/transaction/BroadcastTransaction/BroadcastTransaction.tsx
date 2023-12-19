import { SignedTx, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { TokenRegistry, workflow } from '@emeraldwallet/core';
import { BroadcastData, IState, transaction, txStash } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import { Display } from './display';

interface OwnProps {
  onCancel(): void;
}

interface StateProps {
  createTx: workflow.AnyCreateTx;
  entry: WalletEntry;
  signed: SignedTx;
  tokenRegistry: TokenRegistry;
}

interface DispatchProps {
  broadcastTx(data: BroadcastData): Promise<void>;
}

const BroadcastTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  createTx,
  entry,
  signed,
  tokenRegistry,
  broadcastTx,
  onCancel,
}) => {
  const { display } = new Display({ createTx, entry, signed }, { broadcastTx, onCancel }, tokenRegistry);

  return display.render();
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => {
    const { entry } = txStash.selectors.getEntry(state);

    if (entry == null) {
      throw new Error('Entry not provided!');
    }

    const signed = txStash.selectors.getSigned(state);

    if (signed == null) {
      throw new Error('Signed transaction not provided!');
    }

    const tx = txStash.selectors.getTransaction(state);

    if (tx == null) {
      throw new Error('Transaction not provided!');
    }

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const { id: entryId } = entry;

    return {
      entry,
      signed,
      tokenRegistry,
      createTx: workflow.fromPlainTx(
        tx,
        {
          entryId,
          blockchain: tx.blockchain,
          changeAddress: txStash.selectors.getChangeAddress(state),
        },
        tokenRegistry,
      ),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    broadcastTx(data) {
      return dispatch(transaction.actions.broadcastTx(data));
    },
  }),
)(BroadcastTransaction);
