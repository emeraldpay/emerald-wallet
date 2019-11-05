import { BlockchainCode } from '@emeraldwallet/core';
import {
  addresses, ledger, screen, settings
} from '@emeraldwallet/store';
import { WaitLedgerDialog } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import LedgerImportAccount from './ImportAccount';

const Container = (props: any) => {
  const { connected, ...passProps } = props;
  if (!connected) {
    return (<WaitLedgerDialog onClose={props.onCancel} />);
  }
  return (
    <LedgerImportAccount {...passProps} />
  );
};

const pageSize = 5;

export default connect(
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
      dispatch(ledger.actions.getAddresses(offset, pageSize) as any);
    },
    setSelectedAddr: (addr: string) => {
      dispatch(ledger.actions.selectAddr(addr));
    },
    changeBaseHD: (hdpath: string) => {
      dispatch(ledger.actions.setBaseHD(hdpath));
      dispatch(ledger.actions.getAddresses() as any);
    },
    onInit: () => dispatch(ledger.actions.getAddresses() as any),
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
            dispatch(screen.actions.gotoScreen('account', acc));
          }) as any);
        });
    },
    onCancel: () => {
      if (ownProps.onBackScreen) {
        return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      }
      dispatch(screen.actions.gotoScreen('home'));
    }
  })
)(Container);
