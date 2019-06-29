import React from 'react';
import {connect} from 'react-redux';
import {TxDetails} from '@emeraldwallet/ui';
import {Blockchains, Currency} from '@emeraldwallet/core';
import {Wei} from '@emeraldplatform/eth';
import {screen} from '../../../store';
import createLogger from '../../../utils/logger';
import WalletSettings from '../../../store/wallet/settings';

const {gotoScreen} = screen.actions;
const log = createLogger('TxDetails');

export default connect(
  (state, ownProps) => {
    const Tx = state.wallet.history.get('trackedTransactions').find(
      (tx) => tx.get('hash') === ownProps.hash
    );
    if (!Tx) {
      log.error("Can't find tx for hash", ownProps.hash);
      return {};
    }

    const accounts = state.addresses.get('addresses');
    const fromAccount = Tx.get('from')
      ? accounts.find((acct) => acct.get('id') === Tx.get('from')) : null;
    const toAccount = Tx.get('to')
      ? accounts.find((acct) => acct.get('id') === Tx.get('to')) : null;

    const account = fromAccount || toAccount;
    if (!account) {
      log.error('Unknown account', Tx);
      return {};
    }
    const showRepeat = !!fromAccount;

    const currentCurrency = state.wallet.settings.get('localeCurrency');
    const fiatRate = WalletSettings.selectors.fiatRate(account.get('blockchain'), state);
    const coins = new Wei(Tx.get('value')).toEther();
    const fiatAmount = Currency.format(Number(Currency.convert(coins, fiatRate)), currentCurrency);
    const tx = Tx.toJS();
    const blockchain = Blockchains[tx.chain];
    return {
      goBack: ownProps.goBack,
      openAccount: ownProps.openAccount,
      showRepeat,
      repeatTx: ownProps.repeatTx,
      transaction: tx,
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
