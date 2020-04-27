import { accounts, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';

export interface IOwnProps {
  walletId: string;
}

interface IProps {
  transactions: any;
  accounts: any;
}

function TxHistoryView (props: IProps) {
  return (<TxHistory transactions={props.transactions} walletAccounts={props.accounts} />);
}

export default connect<IProps, {}, IOwnProps, {}>(
  (state: any, ownProps: IOwnProps): IProps => {
    const wallet = accounts.selectors.find(state, ownProps.walletId)!;
    const transactions = txhistory.selectors.getTransactions(state, wallet.accounts);

    return {
      accounts: wallet.accounts,
      transactions
    };
  }
)(TxHistoryView);
