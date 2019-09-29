import { utils } from '@emeraldwallet/core';
import { addresses, screen, settings } from '@emeraldwallet/store';
import { ImportPrivateKey } from '@emeraldwallet/ui';
import { ipcRenderer } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';

export default connect(
  (state, ownProps) => ({
    blockchains: settings.selectors.currentChains(state)
  }),
  (dispatch, ownProps: any) => ({
    onSubmit: (data: any) => {
      return new Promise((resolve, reject) => {
        const privateKey = utils.addHexPrefix(data.privateKey.trim());
        ipcRenderer.send('get-private-key-to-keyfile', { privateKey, password: data.password });
        ipcRenderer.once('recieve-private-key-to-keyfile', (event: any, keyFile: any) => {
          // import key file
          return dispatch(addresses.actions.importWallet(data.blockchain, new Blob([keyFile]), '', '') as any)
            .then((result: any) => {
              if (result.error) {
                dispatch(screen.actions.showError(new Error(result.error.toString())));
              } else {
                // show page with account details
                resolve(dispatch(screen.actions.gotoScreen('account', { id: result, blockchain: data.blockchain })));
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
    }
  })
)(ImportPrivateKey);
