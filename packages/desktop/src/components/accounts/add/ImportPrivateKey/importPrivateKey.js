// @flow
import React from 'react';
import { ipcRenderer } from 'electron'; // eslint-disable-line import/no-extraneous-dependencies
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { ImportPrivateKey } from '@emeraldwallet/ui';
import { utils } from '@emeraldwallet/core';
import accounts from 'store/vault/accounts';
import screen from 'store/wallet/screen';

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      return new Promise((resolve, reject) => {
        const privateKey = utils.addHexPrefix(data.privateKey.trim());
        ipcRenderer.send('get-private-key-to-keyfile', {privateKey, password: data.password});
        ipcRenderer.once('recieve-private-key-to-keyfile', (event, keyFile) => {
          // import key file
          return dispatch(accounts.actions.importWallet(new Blob([keyFile]), '', ''))
            .then((result) => {
              if (result.error) {
                dispatch(screen.actions.showError(new Error(result.error.toString())));
              } else {
                // show page with account details
                resolve(dispatch(screen.actions.gotoScreen('account', Immutable.fromJS({id: result}))));
              }
            });
        });
      });
    },
    onBack: () => {
      if (ownProps.onBackScreen) {
        dispatch(screen.actions.gotoScreen(ownProps.onBackScreen));
      } else {
        dispatch(screen.actions.gotoScreen('home'));
      }
    },
  })
)(ImportPrivateKey);
