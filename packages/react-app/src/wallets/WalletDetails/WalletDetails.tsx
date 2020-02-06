import { blockchainByName, Wallet } from '@emeraldwallet/core';
import { accounts, screen, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';
import WalletDetailsView from './WalletDetailsView';

export default connect(
  (state: any, ownProps: any) => {
    const accountPassed: Wallet = ownProps.wallet;
    // reload account from store, because it can be passed with id only if it was just imported
    const wallet = accounts.selectors.find(state, accountPassed.id)!;
    // const transactions = [];
    const transactions = txhistory.selectors.searchTransactions(
        '', // account.id,
        txhistory.selectors.allTrackedTxs(state));

    return {
      showFiat: true,
      wallet,
      transactions,
      txList: (<TxHistory transactions={transactions} accountId={wallet.id}/>)
    };
  },
  (dispatch, ownProps) => ({
    createTx: () => {
      const { account } = ownProps;
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, { account }));
    },
    showReceiveDialog: () => {
      const { account } = ownProps;
      const blockchain = blockchainByName(account.blockchain);
      const address = {
        value: account.id,
        blockchain: blockchain.params.code,
        coinTicker: blockchain.params.coinTicker
      };
      dispatch(screen.actions.showDialog('receive', address));
    },
    goBack: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    },
    editAccount: (data: Wallet) => {
      return new Promise((resolve, reject) => {
        dispatch(accounts.actions.updateWallet(data.id, data.name || '', data.description || '') as any)
          .then((response: any) => {
            resolve(response);
          });
      });
    }
  })
)(WalletDetailsView);
