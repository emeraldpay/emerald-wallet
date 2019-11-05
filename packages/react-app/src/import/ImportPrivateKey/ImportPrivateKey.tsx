import { utils } from '@emeraldwallet/core';
import { addresses, screen, settings } from '@emeraldwallet/store';
import { ImportPrivateKey } from '@emeraldwallet/ui';
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
        // import pk
        return dispatch(addresses.actions.importPk(data.blockchain, privateKey, data.password, '', '') as any)
          .then((result: any) => {
            if (result.error) {
              dispatch(screen.actions.showError(new Error(result.error.toString())));
            } else {
              // show page with account details
              resolve(dispatch(screen.actions.gotoScreen('account', { id: result, blockchain: data.blockchain })));
            }
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
