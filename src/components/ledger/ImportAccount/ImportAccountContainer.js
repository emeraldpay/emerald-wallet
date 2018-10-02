// @flow
import React from 'react';
import { connect } from 'react-redux';
import { fromJS } from 'immutable';
import ledger from '../../../store/ledger';
import screen from '../../../store/wallet/screen';
import Accounts from '../../../store/vault/accounts';
import ImportAccount from './ImportAccount';
import WaitDialog from '../WaitDialog';

const Container = (props) => {
  const { connected, ...passProps } = props;
  if (!connected) {
    return (<WaitDialog onClose={ props.onCancel } />);
  }
  return (
    <ImportAccount {...passProps} />
  );
};

export default connect(
  (state, ownProps) => ({
    hdbase: state.ledger.getIn(['hd', 'base']),
    connected: state.ledger.get('connected'),
    selected: state.ledger.get('selectedAddr') !== null,
  }),
  (dispatch, ownProps) => ({
    changeBaseHD: (hdpath: string) => {
      dispatch(ledger.actions.setBaseHD(hdpath));
      dispatch(ledger.actions.getAddresses());
    },
    onInit: () => dispatch(ledger.actions.getAddresses()),
    onDashboard: () => {
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
