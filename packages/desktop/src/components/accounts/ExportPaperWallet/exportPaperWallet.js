import React from 'react';
import { connect } from 'react-redux';
import { ExportPaperWallet } from '@emeraldwallet/ui';
import { screen, addresses } from '@emeraldwallet/store';

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    onSubmit: (password) => {
      const address = ownProps.accountId;
      dispatch(addresses.actions.exportPrivateKey(password, address))
        .then((privKey) => {
          return dispatch(screen.actions.gotoScreen('paper-wallet', { address, privKey }));
        })
        .catch((err) => dispatch(screen.actions.showError(err)));
    },
    onBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },

  })
)(ExportPaperWallet);
