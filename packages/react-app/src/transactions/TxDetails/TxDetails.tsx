import { Wallet } from '@emeraldpay/emerald-vault-core';
import { Wei } from '@emeraldplatform/eth';
import { Blockchains, Currency } from '@emeraldwallet/core';
import { accounts, screen, settings, txhistory } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import TxDetails from './TxDetailsView';
import { ITxDetailsProps } from './TxDetailsView/TxDetails';

const { gotoScreen } = screen.actions;

export interface IOwnProps {
  hash: string;
}

interface IDispatchFromProps {
  goBack: any;
  cancel: any;
  openAccount: any;
  openReceipt: () => void;
}

export default connect<ITxDetailsProps, IDispatchFromProps, IOwnProps>(
  (state: any, ownProps: IOwnProps): ITxDetailsProps => {
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);
    if (!tx) {
      throw new Error("Unknown tx: " + ownProps.hash);
    }
    const chain = tx.blockchain;
    const fromAccount = tx.from ? accounts.selectors.findAccountByAddress(state, tx.from, chain) : undefined;
    const toAccount = tx.to ? accounts.selectors.findAccountByAddress(state, tx.to, chain) : undefined;
    const account = fromAccount || toAccount;
    const currentCurrency = settings.selectors.fiatCurrency(state);
    const fiatRate = settings.selectors.fiatRate(chain, state);
    const coins = new Wei(tx.value).toEther();
    const fiatAmount = (fiatRate == null) ? '' : Currency.format(Number(Currency.convert(coins, fiatRate)), currentCurrency);
    const plainTx = tx;
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
        dispatch(gotoScreen(screen.Pages.WALLET, wallet.id));
      } else {
        dispatch(gotoScreen(screen.Pages.HOME));
      }
    },
    openAccount: (wallet?: Wallet) => {
      if (wallet) {
        dispatch(gotoScreen(screen.Pages.WALLET, wallet.id));
      }
    },
    openReceipt: () => {
      dispatch(screen.actions.openTxReceipt(ownProps.hash));
    },
  })
)(TxDetails);
