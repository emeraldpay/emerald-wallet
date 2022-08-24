import { Uuid } from '@emeraldpay/emerald-vault-core';
import { PersistentState } from '@emeraldwallet/core';
import { IState, StoredTransaction, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import List from './List';

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  cursor?: string;
  transactions: StoredTransaction[];
}

interface DispatchProps {
  loadTransactions(walletId: Uuid, cursor?: string): Promise<PersistentState.PageResult<StoredTransaction>>;
}

const TxHistory: React.FC<OwnProps & StateProps & DispatchProps> = ({
  cursor,
  transactions,
  walletId,
  loadTransactions,
}) => {
  const onLoadMore = React.useCallback(() => loadTransactions(walletId, cursor), [cursor, walletId, loadTransactions]);

  React.useEffect(() => {
    (async () => {
      await loadTransactions(walletId);
    })();
  }, [walletId, loadTransactions]);

  return <List cursor={cursor} transactions={transactions} onLoadMore={onLoadMore} />;
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => {
    const { cursor, transactions } = state.history;

    return {
      cursor,
      transactions,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    loadTransactions(walletId, cursor) {
      return dispatch(txhistory.actions.loadTransactions(walletId, cursor));
    },
  }),
)(TxHistory);
