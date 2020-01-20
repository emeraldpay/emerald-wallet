import { WalletOp } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { addresses, screen } from '@emeraldwallet/store';
import { AccountActionsMenu } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { saveJson } from '../../util/save-as';

interface IPropsFromState {
}

interface IOwnProps {
  wallet: WalletOp;
}

const mapStateToProps = (state: any, ownProps: IOwnProps): IPropsFromState => {
  return {
  };
};

export default connect(
  mapStateToProps,
  (dispatch: any, ownProps: IOwnProps) => ({
    // TODO vault v3
    // onPrint: () => {
    //   const address = ownProps.account.id;
    //   const chain = ownProps.account.blockchain;
    //   dispatch(screen.actions.gotoScreen('export-paper-wallet', { address, blockchain: chain }));
    // },
    // TODO vault v3
    // onExport: () => {
    //   const address = ownProps.account.id;
    //   const chain = ownProps.account.blockchain;
    //   dispatch(addresses.actions.exportKeyFile(chain, address))
    //     .then((result: any) => {
    //       saveJson(result, `${chain}-${address}.json`);
    //     });
    // }
  })
)(AccountActionsMenu);
