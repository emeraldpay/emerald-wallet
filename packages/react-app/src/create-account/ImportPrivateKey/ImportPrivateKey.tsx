import { BlockchainCode, utils, Wallet } from '@emeraldwallet/core';
import { accounts, IState, screen } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import ImportPkForm from './ImportPkForm';

interface IImportPkProps {
  wallet: Wallet;
  blockchain: BlockchainCode;
}

export default connect<any, any, IImportPkProps, IState>(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps: IImportPkProps) => ({
    onSubmit: (data: any) => {
      const { blockchain, wallet } = ownProps;
      const { privateKey, password } = data;
      const privKey = utils.addHexPrefix(privateKey.trim());

      dispatch(accounts.actions.importPk(wallet.id, blockchain, privKey, password) as any)
        .then((result: any) => {
          if (result.error) {
            dispatch(screen.actions.showError(new Error(result.error.toString())));
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.wallet.id));
          }
        });
    },
  })
)(ImportPkForm);
