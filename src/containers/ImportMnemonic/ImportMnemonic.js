import React from 'react';
import { connect } from 'react-redux';
import screen from 'store/wallet/screen';
import accounts from 'store/vault/accounts';
import Immutable from 'immutable';
import { SubmissionError } from 'redux-form';
import muiThemeable from 'material-ui/styles/muiThemeable';

import ImportMnemonic from '../../components/accounts/add/ImportMnemonic';


const ImportMnemonicWrapper = ({muiTheme, ...props}) => {
  return (
    <div style={{border: `1px solid ${muiTheme.palette.borderColor}`}}>
      <ImportMnemonic {...props} />
    </div>
  );
};

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    onContinue: (data) => {
      return dispatch(accounts.actions.importMnemonic(data.password, data.mnemonic, data.hdpath, '', ''))
        .then((result) => {
          if (result.error) {
            throw new SubmissionError({ _error: result.error.toString() });
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen('account', Immutable.fromJS({id: result})));
          }
        }).catch((error) => {
          console.error(error);
          throw new SubmissionError({ _error: error.toString() });
        });
    },

    onBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },
  })
)(muiThemeable()(ImportMnemonicWrapper));
