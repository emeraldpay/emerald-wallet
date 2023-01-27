import { Uuid } from '@emeraldpay/emerald-vault-core';
import { IState, StoredTransaction, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import List from './List';

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  cursor?: string;
  lastTxId: string | null;
  transactions: StoredTransaction[];
}

interface DispatchProps {
  loadTransactions(walletId: Uuid, initial: boolean): Promise<void>;
  setLastTxId(txId: string | null): void;
}

const TxHistory: React.FC<OwnProps & StateProps & DispatchProps> = ({
  cursor,
  lastTxId,
  transactions,
  walletId,
  loadTransactions,
  setLastTxId,
}) => (
  <List
    cursor={cursor}
    lastTxId={lastTxId}
    transactions={transactions}
    walletId={walletId}
    onLoadMore={() => loadTransactions(walletId, false)}
    setLastTxId={setLastTxId}
  />
);

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => {
    const { cursor, lastTxId, transactions } = state.history;

    return {
      cursor,
      lastTxId,
      transactions,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    loadTransactions(walletId, initial) {
      return dispatch(txhistory.actions.loadTransactions(walletId, initial));
    },
    setLastTxId(txId) {
      dispatch(txhistory.actions.setLastTxId(txId));
    },
  }),
)(TxHistory);
