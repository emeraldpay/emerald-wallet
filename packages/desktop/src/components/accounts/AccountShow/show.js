import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { AccountDetailsView, TokenBalances } from '@emeraldwallet/react-app';
import { blockchainByName } from '@emeraldwallet/core';
import { screen, addresses, txhistory } from '@emeraldwallet/store';

import tokens from '../../../store/vault/tokens';
import createLogger from '../../../utils/logger';
import TransactionsList from '../../tx/TxHistory';

export const styles2 = {
  transContainer: {
    marginTop: '20px',
  },
  qrCodeContainer: {
    flexBasis: '30%',
    backgroundColor: 'white',
  },
};

const log = createLogger('AccountShow');

export default connect(
  (state, ownProps) => {
    const accountPassed = ownProps.account;
    // reload account from store, because it can be passed with id only if it was just imported
    const account = addresses.selectors.find(state, accountPassed.get('id'), accountPassed.get('blockchain'));
    if (typeof account === 'undefined') {
      log.error('Unknown account', typeof accountPassed === 'undefined' || typeof accountPassed.toJS !== 'function' ? accountPassed : accountPassed.toJS());
      return {};
    }
    let transactions = Immutable.List();
    let tokensBalances = Immutable.List();

    if (account && account.get('id')) {
      transactions = txhistory.selectors.searchTransactions(
        account.get('id'),
        state.wallet.history.get('trackedTransactions')
      );
      tokensBalances = tokens.selectors.balancesByAddress(state.tokens, account.get('id'));
    } else {
      log.warn("Can't find account in general list of accounts", account.get('id'));
    }

    return {
      showFiat: true,
      tokens: (<TokenBalances balances={tokensBalances}/>),
      account,
      transactions,
      txList: (<TransactionsList transactions={transactions} accountId={account.get('id')}/>),
    };
  },
  (dispatch, ownProps) => ({
    createTx: () => {
      const {account} = ownProps;
      dispatch(screen.actions.gotoScreen('create-tx', account));
    },
    showReceiveDialog: () => {
      const {account} = ownProps;
      const blockchain = blockchainByName(account.get('blockchain'));
      const address = {
        value: account.get('id'),
        blockchain: blockchain.params.code,
        coinTicker: blockchain.params.coinTicker,
      };
      dispatch(screen.actions.showDialog('receive', address));
    },
    goBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },
    editAccount: (data) => {
      return new Promise((resolve, reject) => {
        dispatch(addresses.actions.updateAccount(data.blockchain, data.id, data.value, data.description))
          .then((response) => {
            resolve(response);
          });
      });
    },
  })
)(AccountDetailsView);
