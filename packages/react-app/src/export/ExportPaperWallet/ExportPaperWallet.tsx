import { Account, blockchainByName } from '@emeraldwallet/core';
import { accounts, screen } from '@emeraldwallet/store';
import { ExportPaperWallet } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

export interface IOwnProps {
  account: any;
}

interface IDispatchProps {
  onSubmit: any;
  onBack: any;
}
interface IRendererProps {
  accountId: any;
}

export default connect<IRendererProps, IDispatchProps, IOwnProps, {}>(
  (state, ownProps) => ({
    accountId: ownProps.account.address
  }),
  (dispatch, ownProps: IOwnProps) => ({
    onSubmit: (password: string) => {
      const account: Account = ownProps.account;
      const blockchainName = blockchainByName(account.blockchain)!.getTitle();
      dispatch(accounts.actions.exportPrivateKey(password, account.id))
        .then((privKey: string) => {
          const paperWalletData = {
            address: account.address,
            privKey,
            blockchain: blockchainName
          };
          return dispatch(screen.actions.gotoScreen('paper-wallet', paperWalletData));
        })
        .catch((err: any) => dispatch(screen.actions.showError(err)));
    },
    onBack: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    }

  })
)(ExportPaperWallet);
