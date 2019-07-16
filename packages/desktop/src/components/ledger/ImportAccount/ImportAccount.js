// @flow
import React from 'react';
import { connect } from 'react-redux';
import { WaitLedgerDialog, LedgerImportAccount } from '@emeraldwallet/ui';
import { fromJS } from 'immutable';
import { ledger, addresses, screen } from '@emeraldwallet/store';
import settings from '../../../store/wallet/settings';

const Container = (props) => {
  const { connected, ...passProps } = props;
  if (!connected) {
    return (<WaitLedgerDialog onClose={ props.onCancel } />);
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
    accounts: state.addresses.get('addresses'),
    blockchains: settings.selectors.currentChains(state),
    api: global.api,
  }),
  (dispatch, ownProps) => ({
    setPagerOffset: (offset) => {
      dispatch(ledger.actions.getAddresses(offset, pageSize));
    },
    setSelectedAddr: (addr) => {
      dispatch(ledger.actions.selectAddr(addr));
    },
    changeBaseHD: (hdpath: string) => {
      dispatch(ledger.actions.setBaseHD(hdpath));
      dispatch(ledger.actions.getAddresses());
    },
    onInit: () => dispatch(ledger.actions.getAddresses()),
    onBack: () => {
      if (ownProps.onBackScreen) {
        return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      }
      dispatch(screen.actions.gotoScreen('home'));
    },
    onAddSelected: (blockchain) => {
      let acc = null;
      dispatch(ledger.actions.importSelected(blockchain))
        .then((address) => {
          acc = fromJS({ id: address, blockchain });
          return dispatch(addresses.actions.loadAccountsList(null, () => {
            // go to account details only when accounts updated
            dispatch(screen.actions.gotoScreen('account', acc));
          }));
        });
    },
    onCancel: () => {
      if (ownProps.onBackScreen) {
        return dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      }
      dispatch(screen.actions.gotoScreen('home'));
    },
  })
)(Container);
