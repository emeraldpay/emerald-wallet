import { Wei } from '@emeraldplatform/eth';
import {Blockchains, Currency} from '@emeraldwallet/core';
import { addresses, screen, settings, txhistory } from '@emeraldwallet/store';
import { TxDetails } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { Wallet } from '@emeraldpay/emerald-vault-core';

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
    const fromWallet = tx.get('from') ? addresses.selectors.findWalletByAddress(state, tx.get('from'), chain) : undefined;
    const toWallet = tx.get('to') ? addresses.selectors.findWalletByAddress(state, tx.get('to'), chain) : undefined;
    const wallet = fromWallet || toWallet;
    const showRepeat = !!fromWallet;
    const currentCurrency = settings.selectors.fiatCurrency(state);
    const fiatRate = settings.selectors.fiatRate(chain, state);
    const coins = new Wei(tx.get('value')).toEther();
    const fiatAmount = (fiatRate == null) ? '' : Currency.format(Number(Currency.convert(coins, fiatRate)), currentCurrency);
    const plainTx = tx.toJS();
    const blockchain = Blockchains[plainTx.blockchain];
    return {
      goBack: ownProps.goBack,
      showRepeat,
      repeatTx: ownProps.repeatTx,
      transaction: plainTx,
      tokenSymbol: (blockchain && blockchain.params.coinTicker) || '',
      wallet,
      fiatAmount,
      fiatCurrency: currentCurrency,
      fromWallet: fromWallet,
      toWallet: toWallet
    };
  },
  (dispatch, ownProps) => ({
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
    openAccount: (wallet: Wallet) => {
      if (wallet) {
        dispatch(gotoScreen(screen.Pages.WALLET, wallet));
      }
    },
    repeatTx: (transaction: any, toWallet: Wallet, fromWallet: Wallet) => {
      dispatch(gotoScreen('repeat-tx', { transaction, toWallet, fromWallet }));
    }
  })
)(TxDetails);
