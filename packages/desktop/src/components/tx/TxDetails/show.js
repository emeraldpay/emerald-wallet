import React from 'react';
import { connect } from 'react-redux';
import { TxDetails } from '@emeraldwallet/ui';
import launcher from 'store/launcher';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';
import createLogger from '../../../utils/logger';

const log = createLogger('TxDetails');

export default connect(
  (state, ownProps) => {
    const accounts = state.accounts.get('accounts');
    const account = accounts.find(
      (acct) => acct.get('id') === ownProps.accountId
    );
    const rates = state.wallet.settings.get('rates');
    const currentCurrency = state.wallet.settings.get('localeCurrency');

    const Tx = state.wallet.history.get('trackedTransactions').find(
      (tx) => tx.get('hash') === ownProps.hash
    );
    if (!Tx) {
      log.error("Can't find tx for hash", ownProps.hash);
    }
    const fromAccount = Tx.get('from')
      ? accounts.find((acct) => acct.get('id') === Tx.get('from')) : null;
    const toAccount = Tx.get('to')
      ? accounts.find((acct) => acct.get('id') === Tx.get('to')) : null;

    const showRepeat = !!fromAccount;

    return {
      goBack: ownProps.goBack,
      openAccount: ownProps.openAccount,
      showRepeat,
      repeatTx: ownProps.repeatTx,
      showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
      transaction: Tx.toJS(),
      account,
      rates,
      currentCurrency,
      fromAccount,
      toAccount,
    };
  },
  (dispatch, ownProps) => ({
    cancel: () => {
      dispatch(gotoScreen('home'));
    },
    goBack: (account) => {
      if (account) {
        dispatch(gotoScreen('account', account));
      } else {
        dispatch(gotoScreen('home'));
      }
    },
    openAccount: (account) => {
      if (account) {
        dispatch(gotoScreen('account', account));
      }
    },
    repeatTx: (transaction, toAccount, fromAccount) => {
      dispatch(gotoScreen('repeat-tx', {transaction, toAccount, fromAccount}));
    },
  })
)(TxDetails);
