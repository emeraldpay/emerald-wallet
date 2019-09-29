import { Wei } from '@emeraldplatform/eth';
import { Blockchains, Currency } from '@emeraldwallet/core';
import { addresses, screen, settings, txhistory } from '@emeraldwallet/store';
import { TxDetails } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

const { gotoScreen } = screen.actions;

export interface ITxDetailsProps {
  hash: string;
  repeatTx: any;
  goBack: any;
}

export default connect(
  (state: any, ownProps: ITxDetailsProps) => {
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);
    const chain = tx.get('blockchain');
    const fromAccount = tx.get('from') ? addresses.selectors.find(state, tx.get('from'), chain) : undefined;
    const toAccount = tx.get('to') ? addresses.selectors.find(state, tx.get('to'), chain) : undefined;
    const account = fromAccount || toAccount;
    const showRepeat = !!fromAccount;
    const currentCurrency = settings.selectors.fiatCurrency(state);
    const fiatRate = settings.selectors.fiatRate(chain, state);
    const coins = new Wei(tx.get('value')).toEther();
    const fiatAmount = Currency.format(Number(Currency.convert(coins, fiatRate)), currentCurrency);
    const plainTx = tx.toJS();
    const blockchain = Blockchains[plainTx.blockchain];
    return {
      goBack: ownProps.goBack,
      showRepeat,
      repeatTx: ownProps.repeatTx,
      transaction: plainTx,
      tokenSymbol: (blockchain && blockchain.params.coinTicker) || '',
      account,
      fiatAmount,
      fiatCurrency: currentCurrency,
      fromAccount,
      toAccount
    };
  },
  (dispatch, ownProps) => ({
    cancel: () => {
      dispatch(gotoScreen('home'));
    },
    goBack: (account: any) => {
      if (account) {
        dispatch(gotoScreen('account', account));
      } else {
        dispatch(gotoScreen('home'));
      }
    },
    openAccount: (account: any) => {
      if (account) {
        dispatch(gotoScreen('account', account));
      }
    },
    repeatTx: (transaction: any, toAccount: any, fromAccount: any) => {
      dispatch(gotoScreen('repeat-tx', { transaction, toAccount, fromAccount }));
    }
  })
)(TxDetails);
