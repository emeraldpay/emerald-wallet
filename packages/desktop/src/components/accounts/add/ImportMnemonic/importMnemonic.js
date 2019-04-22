// @flow
import React from 'react';
import { connect } from 'react-redux';
import { ImportMnemonic } from '@emeraldwallet/ui';
import screen from 'store/wallet/screen';

export default connect(
  (state, ownProps) => ({
    initialValues: {
      mnemonic: ownProps.mnemonic,
      hdpath: "m/44'/60'/160720'/0'",
    },
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return ownProps.onContinue(data);
    },

    onBack: () => {
      if (ownProps.onBack) {
        ownProps.onBack();
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
  })
)(ImportMnemonic);
