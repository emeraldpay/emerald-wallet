import React from 'react';
import {connect} from 'react-redux';
import {TxDetails} from '@emeraldwallet/ui';
import {Currency} from '@emeraldwallet/core';
import {Wei} from '@emeraldplatform/eth';
import launcher from 'store/launcher';
import {screen} from '../../../store';
import createLogger from '../../../utils/logger';
import WalletSettings from '../../../store/wallet/settings';
import Wallet from '../../../store/wallet';

const {gotoScreen} = screen.actions;
const log = createLogger('TxDetails');

export default connect(
  (state, ownProps) => {
    const accounts = state.accounts.get('accounts');
    const account = accounts.find(
      (acct) => acct.get('id') === ownProps.accountId
    );

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

    let fiatAmount = null;
    const currentCurrency = state.wallet.settings.get('localeCurrency');
    if (launcher.selectors.getChainName(state).toLowerCase() === 'mainnet') {
      const fiatRate = WalletSettings.selectors.fiatRate(state);
      const coins = new Wei(Tx.get('value')).toEther();
      fiatAmount = Currency.format(Number(Currency.convert(coins, fiatRate)), currentCurrency);
    }
    const blockchain = Wallet.selectors.currentBlockchain(state);
    return {
      goBack: ownProps.goBack,
      openAccount: ownProps.openAccount,
      showRepeat,
      repeatTx: ownProps.repeatTx,
      transaction: Tx.toJS(),
      tokenSymbol: (blockchain && blockchain.params.coinTicker) || '',
      account,
      fiatAmount,
      fiatCurrency: currentCurrency,
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
