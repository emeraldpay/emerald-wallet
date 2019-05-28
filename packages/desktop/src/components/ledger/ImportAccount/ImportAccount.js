// @flow
import React from 'react';
import { connect } from 'react-redux';
import { WaitLedgerDialog, LedgerImportAccount } from '@emeraldwallet/ui';
import { fromJS } from 'immutable';
import ledger from '../../../store/ledger';
import screen from '../../../store/wallet/screen';
import Accounts from '../../../store/vault/accounts';
import AccountBalance from '../../accounts/Balance/balance';

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
    pagerOffset: state.ledger.getIn(['hd', 'offset']),
    hdbase: state.ledger.getIn(['hd', 'base']),
    connected: state.ledger.get('connected'),
    selected: state.ledger.get('selectedAddr') !== null,
    selectedAddress: state.ledger.get('selectedAddr'),
    addresses: state.ledger.get('addresses').toJS(),
    accounts: state.accounts.get('accounts'),
    balanceRender: (balance) => (<AccountBalance symbol="ETC" balance={balance} showFiat={true} withAvatar={false} />), // eslint-disable-line
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
    onAddSelected: () => {
      let acc = null;
      dispatch(ledger.actions.importSelected())
        .then((address) => {
          acc = fromJS({ id: address });
          return dispatch(Accounts.actions.loadAccountsList());
        })
        .then(() => {
          // go to account details only when accounts updated
          return dispatch(screen.actions.gotoScreen('account', acc));
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
