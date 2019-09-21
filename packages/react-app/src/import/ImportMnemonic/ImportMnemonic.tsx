import { BlockchainCode } from '@emeraldwallet/core';
import { addresses, screen, settings } from '@emeraldwallet/store';
import { ImportMnemonic } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

export interface IInputMnemonicProps {
  mnemonic: string;
}

export default connect(
  (state, ownProps: IInputMnemonicProps) => ({
    initialValues: {
      mnemonic: ownProps.mnemonic,
      hdpath: "m/44'/60'/0'/0'"
    },
    blockchains: settings.selectors.currentChains(state)
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data: {blockchain: BlockchainCode, password: string, mnemonic: string, hdpath: string}) => {
      return dispatch(addresses.actions.importMnemonic(data.blockchain, data.password, data.mnemonic, data.hdpath, '', '') as any)
        .then((result: any) => {
          if (result.error) {
            throw new Error(result.error.toString());
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen('account', { id: result, blockchain: data.blockchain }));
          }
        }).catch((error: any) => {
          console.error(error);
          throw new Error(error.toString());
        });
    },

    onBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    }
  })
)(ImportMnemonic);
