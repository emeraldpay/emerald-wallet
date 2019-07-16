import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { ImportMnemonic } from '@emeraldwallet/ui';
import { screen, addresses } from '@emeraldwallet/store';
import settings from '../../store/wallet/settings';

export default connect(
  (state, ownProps) => ({
    initialValues: {
      mnemonic: ownProps.mnemonic,
      hdpath: "m/44'/60'/0'/0'",
    },
    blockchains: settings.selectors.currentChains(state),
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return dispatch(addresses.actions.importMnemonic(data.blockchain, data.password, data.mnemonic, data.hdpath, '', ''))
        .then((result) => {
          if (result.error) {
            throw new Error(result.error.toString());
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen('account', Immutable.fromJS({id: result, blockchain: data.blockchain})));
          }
        }).catch((error) => {
          console.error(error);
          throw new Error(error.toString());
        });
    },

    onBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },
  })
)(ImportMnemonic);
