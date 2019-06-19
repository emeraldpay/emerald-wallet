import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { ConfirmMnemonic } from '@emeraldwallet/ui';
import { screen } from '@emeraldwallet/store';
import accounts from 'store/vault/accounts';

export default connect(
  (state, ownProps) => ({
    mnemonic: ownProps.mnemonic,
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return dispatch(accounts.actions.importMnemonic(ownProps.formData.chain, ownProps.formData.password, ownProps.formData.mnemonic, ownProps.formData.hdpath, '', ''))
        .then((result) => {
          if (result.error) {
            throw new Error(result.error.toString());
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen('account', Immutable.fromJS({id: result})));
          }
        }).catch((error) => {
          console.error(error);
          throw new Error(error.toString());
        });
    },

    onBack: () => {
      if (ownProps.onBack) {
        ownProps.onBack();
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
  })
)(ConfirmMnemonic);
