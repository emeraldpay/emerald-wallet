import { blockchainByName } from '@emeraldwallet/core';
import { addresses, screen, tokens, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';
import TokenBalances from '../TokenBalances';
import AccountDetailsView from './AccountDetailsView';

export default connect(
  (state: any, ownProps: any) => {
    const accountPassed = ownProps.account;
    // reload account from store, because it can be passed with id only if it was just imported
    const account = addresses.selectors.find(state, accountPassed.id, accountPassed.blockchain)!;
    const transactions = txhistory.selectors.searchTransactions(
        account.id,
        txhistory.selectors.allTrackedTxs(state));
    const tokensBalances = tokens.selectors.selectBalances(state, account.id, account.blockchain);

    return {
      showFiat: true,
      tokens: (<TokenBalances balances={tokensBalances} />),
      account,
      transactions,
      txList: (<TxHistory transactions={transactions} accountId={account.id}/>)
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
      dispatch(screen.actions.gotoScreen('home'));
    },
    loadTokens: (chain: any, token: any, address: string) => {
      dispatch(tokens.actions.requestTokenBalance(chain, token, address));
    },
    editAccount: (data: any) => {
      return new Promise((resolve, reject) => {
        dispatch(addresses.actions.updateAccount(data.blockchain, data.id, data.value, data.description) as any)
          .then((response: any) => {
            resolve(response);
          });
      });
    }
  })
)(AccountDetailsView);
