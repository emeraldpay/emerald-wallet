// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import TxView from '@emeraldwallet/ui/lib/components/tx/TxHistory/TxList/TxItem';
import launcher from '../../../../store/launcher';
import accounts from '../../../../store/vault/accounts';
import wallet from '../../../../store/wallet';
import screen from '../../../../store/wallet/screen';
import WalletHistory from '../../../../store/wallet/history';
import AccountBalance from '../../../accounts/Balance';
import i18n from '../../../../i18n/i18n';
import TokenUnits from '../../../../lib/tokenUnits';

function txValueRenderer(showFiat) {
  return function renderer(balance, ticker) {
    return (<AccountBalance
      // fiatStyle={fiatStyle}
      symbol={ ticker }
      showFiat={ showFiat }
      balance={ new TokenUnits(balance.amount, balance.decimals) }
      withAvatar={ false }
    />);
  };
}

export default connect(
  (state, ownProps) => {
    const getAccount = (addr) => {
      const acc = accounts.selectors.selectAccount(state, addr);
      return acc || Map({});
    };

    const tx = (ownProps.tx && ownProps.tx.toJS()) || {};
    const toAccount = getAccount(tx.to);
    const fromAccount = getAccount(tx.from);

    const token = state.tokens.get('tokens').find((t) => t.get('address') === tx.to);

    const showFiat = !token && launcher.selectors.getChainName(state).toLowerCase() === 'mainnet';
    return {
      amountRenderer: txValueRenderer(showFiat),
      lang: i18n.language,
      tx,
      toAccount: (toAccount && toAccount.toJS()) || {},
      fromAccount: (fromAccount && fromAccount.toJS()) || {},
      token: (token && token.toJS()) || null,
      netParams: {
        requiredConfirmations: state.wallet.settings.get('numConfirmations'),
        currentBlockHeight: state.network.getIn(['currentBlock', 'height']),
      },
    };
  },

  (dispatch, ownProps) => ({
    openTx: () => {
      const { tx } = ownProps;
      dispatch(screen.actions.gotoScreen('transaction', {
        hash: tx.get('hash'),
        accountId: ownProps.accountId,
      }));
    },
    openAccount: (address: string) => {
      dispatch(wallet.actions.showAccountDetails(address));
    },
    refreshTx: () => {
      const hash = ownProps.tx.get('hash');
      dispatch(WalletHistory.actions.refreshTransaction(hash));
    },
  })
)(TxView);
