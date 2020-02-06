import { Wallet } from '@emeraldpay/emerald-vault-core';
import { Wei } from '@emeraldplatform/eth';
import { Blockchains, Currency } from '@emeraldwallet/core';
import { accounts, screen, settings, txhistory } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxDetails from './TxDetailsView';
import { ITxDetailsProps } from './TxDetailsView/TxDetails';

const { gotoScreen } = screen.actions;

export interface IOwnProps {
  hash: string;
}

interface IDispatchFromProps {
  repeatTx: any;
  goBack: any;
  cancel: any;
  openAccount: any;
}

export default connect<ITxDetailsProps, IDispatchFromProps, IOwnProps>(
  (state: any, ownProps: IOwnProps): ITxDetailsProps => {
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);
    const chain = tx.get('blockchain');
    const fromAccount = tx.get('from') ? accounts.selectors.findAccountByAddress(state, tx.get('from'), chain) : undefined;
    const toAccount = tx.get('to') ? accounts.selectors.findAccountByAddress(state, tx.get('to'), chain) : undefined;
    const account = fromAccount || toAccount;
    const showRepeat = !!fromAccount;
    const currentCurrency = settings.selectors.fiatCurrency(state);
    const fiatRate = settings.selectors.fiatRate(chain, state);
    const coins = new Wei(tx.get('value')).toEther();
    const fiatAmount = (fiatRate == null) ? '' : Currency.format(Number(Currency.convert(coins, fiatRate)), currentCurrency);
    const plainTx = tx.toJS();
    const blockchain = Blockchains[plainTx.blockchain];
    return {
      transaction: plainTx,
      tokenSymbol: (blockchain && blockchain.params.coinTicker) || '',
      account,
      fiatAmount,
      fiatCurrency: currentCurrency,
      fromAccount,
      toAccount
    };
  },
  (dispatch: any, ownProps: IOwnProps): IDispatchFromProps => ({
    cancel: () => {
      dispatch(gotoScreen(screen.Pages.HOME));
    },
    goBack: (wallet: Wallet) => {
      if (wallet) {
        dispatch(gotoScreen(screen.Pages.WALLET, wallet));
      } else {
        dispatch(gotoScreen(screen.Pages.HOME));
      }
    },
    openAccount: (wallet?: Wallet) => {
      if (wallet) {
        dispatch(gotoScreen(screen.Pages.WALLET, wallet));
      }
    },
    repeatTx: (transaction: any, toWallet: Wallet, fromWallet: Wallet) => {
      dispatch(gotoScreen('repeat-tx', { transaction, toWallet, fromWallet }));
    }
  })
)(TxDetails);
