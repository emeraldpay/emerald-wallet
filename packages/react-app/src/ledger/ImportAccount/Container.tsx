import { BlockchainCode } from '@emeraldwallet/core';
import {
  addresses, ledger, screen, settings, State
} from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitDialog from '../WaitDialog';
import LedgerImportAccount from './ImportAccount';

const Container = (props: any) => {
  const { connected, ...passProps } = props;
  if (!connected) {
    return (<WaitDialog onClose={props.onCancel} onClickBuyLedger={props.onClickBuyLedger} />);
  }
  return (
    <LedgerImportAccount {...passProps} />
  );
};

const pageSize = 5;

export default connect<any, any, any, State>(
  (state, ownProps) => ({
    pagerOffset: ledger.selectors.getOffset(state),
    hdbase: ledger.selectors.getHdBase(state),
    connected: ledger.selectors.isConnected(state),
    selected: ledger.selectors.hasSelected(state),
    selectedAddress: ledger.selectors.getSelected(state),
    addresses: ledger.selectors.getAddresses(state),
    accounts: addresses.selectors.all(state),
    blockchains: settings.selectors.currentChains(state),
    // TODO: Fix this dependency
    api: (global as any).api
  }),
  (dispatch, ownProps: any) => ({
    setPagerOffset: (offset: number) => {
      dispatch(ledger.actions.getAddressesAction(offset, pageSize));
    },
    setSelectedAddr: (addr: string) => {
      dispatch(ledger.actions.selectAddressAction(addr));
    },
    changeBaseHD: (hdpath: string) => {
      dispatch(ledger.actions.setBaseHD(hdpath));
      dispatch(ledger.actions.getAddressesAction());
    },
    onInit: () => dispatch(ledger.actions.getAddressesAction()),
    onBack: () => {
      if (ownProps.onBackScreen) {
        return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      }
      dispatch(screen.actions.gotoScreen('home'));
    },
    onAddSelected: (blockchain: BlockchainCode) => {
      dispatch(ledger.actions.importSelected(blockchain) as any)
        .then((address: string) => {
          const acc = { id: address, blockchain };
          return dispatch(addresses.actions.loadAccountsList(() => {
            // go to account details only when accounts updated
            dispatch(screen.actions.gotoScreen(screen.Pages.ACCOUNT, acc));
          }) as any);
        });
    },
    onClickBuyLedger: () => {
      dispatch(screen.actions.openLink('https://emeraldwallet.io/ledger-hardware-wallet'));
    },
    onCancel: () => {
      if (ownProps.onBackScreen) {
        return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      }
      dispatch(screen.actions.gotoScreen('home'));
    }
  })
)(Container);
