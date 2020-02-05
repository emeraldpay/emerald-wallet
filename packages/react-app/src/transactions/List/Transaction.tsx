import { blockchainById, blockchainByName, BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { addresses, blockchains, IState, screen, settings, txhistory, wallet } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import Balance from '../../common/Balance';
import i18n from '../../i18n';
import TxView from './TxItemView';
import { ITxItemProps } from './TxItemView/TxItem';

function txValueRenderer (showFiat: boolean) {
  return function renderer (balance: any, ticker: string) {
    return (
      <Balance
      // fiatStyle={fiatStyle}
        symbol={ticker}
        showFiat={showFiat}
        balance={balance.amount}
        decimals={balance.decimals}
        withAvatar={false}
      />
    );
  };
}

export interface IOwnProps {
  hash: string;
  walletId?: string;
}

export interface IDispatchProps {
  openAccount: any;
  openTx: any;
}

export default connect<ITxItemProps, IDispatchProps, IOwnProps, IState>(
  (state, ownProps: IOwnProps): any => {
    // TODO: .toJS() call impact on performance
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash).toJS();
    const blockchain = tx.blockchain ? blockchainByName(tx.blockchain) : blockchainById(tx.chainId);

    const toAccount = addresses.selectors.findAccountByAddress(state, tx.to, blockchain!.params.code) || {};
    const fromAccount = addresses.selectors.findAccountByAddress(state, tx.from, blockchain!.params.code) || {};

    // console.log("accounts", toAccount, fromAccount);

    // TODO: fix it !
    const token = null; // state.tokens.get('tokens').find((t) => t.get('address') === tx.to);

    const showFiat = false;

    return {
      coinTicker: blockchain!.params.coinTicker,
      amountRenderer: txValueRenderer(showFiat),
      lang: i18n.language,
      tx,
      toAccount,
      fromAccount,
      token: null,
      netParams: {
        requiredConfirmations: settings.selectors.numConfirms(state),
        currentBlockHeight: blockchains.selectors.getHeight(state, blockchain!.params.coinTicker)
      }
    };
  },

  (dispatch, ownProps: IOwnProps): IDispatchProps => ({
    openTx: () => {
      const { hash } = ownProps;
      dispatch(screen.actions.gotoScreen('transaction', {
        hash,
        accountId: ownProps.walletId
      }));
    },
    openAccount: (blockchain: BlockchainCode, address: string) => {
      dispatch(wallet.actions.openAccountDetails(blockchain, address));
    }
  })
)(TxView);
