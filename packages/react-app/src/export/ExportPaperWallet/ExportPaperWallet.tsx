import { addresses, screen } from '@emeraldwallet/store';
import { ExportPaperWallet } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { EthereumAccount } from '@emeraldpay/emerald-vault-core';
import {blockchainById} from "@emeraldwallet/core";

export default connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps: any) => ({
    onSubmit: (password: string) => {
      const account: EthereumAccount = ownProps.account;
      const blockchainName = blockchainById(account.blockchain)!.getTitle();
      dispatch(addresses.actions.exportPrivateKey(account.id, password))
        .then((privKey: string) => {
          return dispatch(screen.actions.gotoScreen('paper-wallet', { address: account.address, privKey, blockchain: blockchainName }));
        })
        .catch((err: any) => dispatch(screen.actions.showError(err)));
    },
    onBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    }

  })
)(ExportPaperWallet);
