import { BlockchainCode, IAccount } from '@emeraldwallet/core';
import { addresses, screen, txhistory } from '@emeraldwallet/store';
import { AccountActionsMenu } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { saveJson } from '../../util/save-as';

const hasBalance = (account: IAccount): boolean => (!account.balance)
  || (account.balance && account.balance.toWei().gt(0));

interface PropsFromState {
  chain: any;
  showPrint: any;
  showExport: any;
  hiddenAccount: boolean;
  canHide: boolean;
}

interface DispatchFromProps {

}

interface OwnProps {
  account: IAccount;
}

const mapStateToProps = (state: any, ownProps: OwnProps): PropsFromState => {
  return {
    chain: ownProps.account.blockchain,
    showPrint: !ownProps.account.hardware || false,
    showExport: !ownProps.account.hardware || false,
    hiddenAccount: ownProps.account.hidden || false,
    canHide: false && !hasBalance(ownProps.account)
  };
};

export default connect<PropsFromState, DispatchFromProps, OwnProps>(
  mapStateToProps,
  (dispatch: any, ownProps) => ({
    onPrint: (chain: string) => () => {
      const address = ownProps.account.id;
      dispatch(screen.actions.gotoScreen('export-paper-wallet', { address, blockchain: chain }));
    },
    onHide: (chain: string) => () => {
      // TODO not implemented
      // const address = ownProps.account.id;
      // dispatch(screen.actions.showDialog('hide-account', { id: address, blockchain: chain }));
    },
    onUnhide: (chain: BlockchainCode) => () => {
      // TODO not implemented
      // const address = ownProps.account.id;
      // dispatch(addresses.actions.unhideAccount(chain, address));
      // // refresh account data
      // dispatch(txhistory.actions.refreshTrackedTransactions());
      // dispatch(addresses.actions.loadAccountsList());
      // // dispatch(accounts.actions.loadPendingTransactions()); // TODO: do we need it ?

      dispatch(screen.actions.gotoScreen('home'));
    },
    onExport: (chain: BlockchainCode) => () => {
      const address = ownProps.account.id;
      dispatch(addresses.actions.exportKeyFile(chain, address))
        .then((result: any) => {
          saveJson(result, `${chain}-${address}.json`);
        });
    }
  })
)(AccountActionsMenu);
