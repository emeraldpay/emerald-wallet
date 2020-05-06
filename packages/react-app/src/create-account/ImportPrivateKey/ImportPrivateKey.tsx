import { BlockchainCode, utils } from '@emeraldwallet/core';
import { accounts, IState, screen } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import ImportPkForm from './ImportPkForm';

interface IImportPkProps {
  blockchain: BlockchainCode;
}

export default connect<any, any, IImportPkProps, IState>(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps: IImportPkProps) => ({
    onSubmit: (data: any) => {
      const { blockchain } = ownProps;
      const { privateKey, password } = data;
      const privKey = utils.addHexPrefix(privateKey.trim());

      dispatch(accounts.actions.importPk(blockchain, privKey, password) as any)
        .then((result: any) => {
          if (result.error) {
            dispatch(screen.actions.showError(new Error(result.error.toString())));
          } else {
            // show page with account details
            dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, result));
          }
        });
    }
  })
)(ImportPkForm);
