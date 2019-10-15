import React from 'react';
import { connect } from 'react-redux';
import { ConfirmMnemonic } from '@emeraldwallet/ui';
import { screen, addresses } from '@emeraldwallet/store';

export default connect(
  (state, ownProps) => ({
    mnemonic: ownProps.mnemonic,
    dpath: ownProps.formData.hdpath,
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return dispatch(addresses.actions.importMnemonic(ownProps.formData.blockchain, ownProps.formData.password, ownProps.formData.mnemonic, ownProps.formData.hdpath, '', ''))
        .then((result) => {
          if (result.error) {
            throw new Error(result.error.toString());
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen('account', {id: result, blockchain: ownProps.formData.blockchain}));
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
