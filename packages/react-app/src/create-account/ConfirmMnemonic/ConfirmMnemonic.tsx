import { accounts, screen } from '@emeraldwallet/store';
import { ConfirmMnemonic } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

export default connect(
  (state, ownProps: any) => ({
    mnemonic: ownProps.mnemonic,
    dpath: ownProps.formData.hdpath
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data: any) => {
      return dispatch(accounts.actions.importMnemonic(
        ownProps.formData.blockchain,
        ownProps.formData.password,
        ownProps.formData.mnemonic,
        ownProps.formData.hdpath, '') as any)
        .then((result: any) => {
          if (result.error) {
            throw new Error(result.error.toString());
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, result.walletId));
          }
        }).catch((error: any) => {
          console.error(error);
          throw new Error(error.toString());
        });
    },

    onBack: () => {
      if (ownProps.onBack) {
        ownProps.onBack();
      } else {
        dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
      }
    }
  })
)(ConfirmMnemonic);
