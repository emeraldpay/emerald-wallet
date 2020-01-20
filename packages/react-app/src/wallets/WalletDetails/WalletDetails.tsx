import { Wallet, WalletOp } from '@emeraldpay/emerald-vault-core';
import { blockchainById, blockchainByName } from '@emeraldwallet/core';
import { addresses, screen, tokens, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';
import TokenBalances from '../TokenBalances';
import WalletDetailsView from './WalletDetailsView';

export default connect(
  (state: any, ownProps: any) => {
    const accountPassed: Wallet = ownProps.wallet;
    // reload account from store, because it can be passed with id only if it was just imported
    const wallet = addresses.selectors.find(state, accountPassed.id)!;
    // const transactions = [];
    const transactions = [] || txhistory.selectors.searchTransactions(
        '', // account.id,
        txhistory.selectors.allTrackedTxs(state));
    let tokensBalances = null;
    if (wallet.getEthereumAccounts().length > 0) {
      const firstAccount = wallet.getEthereumAccounts()[0];
      const blockchainCode = blockchainById(firstAccount.blockchain)!.params.code;
      tokensBalances = tokens.selectors.selectBalances(state, firstAccount.address, blockchainCode);
    }

    return {
      showFiat: true,
      tokens: (<TokenBalances balances={tokensBalances} />),
      wallet,
      transactions,
      txList: (<span>NOT IMPLEMENTED</span>) // (<TxHistory transactions={transactions} accountId={wallet.id}/>)
    };
  },
  (dispatch, ownProps) => ({
    createTx: () => {
      const { account } = ownProps;
      dispatch(screen.actions.gotoScreen('create-tx', account));
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
        dispatch(addresses.actions.updateWallet(data.id, data.name || '', data.description || '') as any)
          .then((response: any) => {
            resolve(response);
          });
      });
    }
  })
)(WalletDetailsView);
