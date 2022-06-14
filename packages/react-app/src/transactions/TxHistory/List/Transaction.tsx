import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { IState, screen, txhistory, wallet } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxItem from './TxItemView/TxItem';

interface OwnProps {
  hash: string;
}

interface StateProps {
  tx: PersistentState.Transaction;
}

interface DispatchProps {
  openAccount: (blockchain: BlockchainCode, address: string) => void;
  openTransaction: () => void;
}

const Transaction: React.FC<OwnProps & StateProps & DispatchProps> = ({ tx, openAccount, openTransaction }) => (
  <TxItem tx={tx} openAccount={openAccount} openTransaction={openTransaction} />
);

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps): StateProps => {
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);

    if (tx == null) {
      throw new Error('Unknown tx: ' + ownProps.hash);
    }

    return { tx };
  },
  (dispatch, ownProps) => {
    return {
      openAccount: (blockchain: BlockchainCode, address: string): void => {
        dispatch(wallet.actions.openAccountDetails(blockchain, address));
      },
      openTransaction: (): void => {
        dispatch(screen.actions.gotoScreen(screen.Pages.TX_DETAILS, { hash: ownProps.hash }));
      },
    };
  },
)(Transaction);
