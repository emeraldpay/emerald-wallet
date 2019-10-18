import { IAccount } from '@emeraldwallet/core';
import { addresses, screen } from '@emeraldwallet/store';
import { AccountActionsMenu } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { saveJson } from '../../util/save-as';

const hasBalance = (account: IAccount): boolean => (!account.balance)
  || (account.balance && account.balance.toWei().gt(0));

interface IPropsFromState {
  chain: any;
  showPrint: any;
  showExport: any;
  hiddenAccount: boolean;
  canHide: boolean;
}

interface IOwnProps {
  account: IAccount;
}

const mapStateToProps = (state: any, ownProps: IOwnProps): IPropsFromState => {
  return {
    chain: ownProps.account.blockchain,
    showPrint: !ownProps.account.hardware || false,
    showExport: !ownProps.account.hardware || false,
    hiddenAccount: ownProps.account.hidden || false,
    canHide: false && !hasBalance(ownProps.account)
  };
};

export default connect(
  mapStateToProps,
  (dispatch: any, ownProps: IOwnProps) => ({
    onPrint: () => {
      const address = ownProps.account.id;
      const chain = ownProps.account.blockchain;
      dispatch(screen.actions.gotoScreen('export-paper-wallet', { address, blockchain: chain }));
    },
    onHide: () => {
      // TODO not implemented
      // const address = ownProps.account.id;
      // dispatch(screen.actions.showDialog('hide-account', { id: address, blockchain: chain }));
    },
    onUnhide: () => {
      // TODO not implemented
      // const address = ownProps.account.id;
      // dispatch(addresses.actions.unhideAccount(chain, address));
      // // refresh account data
      // dispatch(txhistory.actions.refreshTrackedTransactions());
      // dispatch(addresses.actions.loadAccountsList());
      // // dispatch(accounts.actions.loadPendingTransactions()); // TODO: do we need it ?

      dispatch(screen.actions.gotoScreen('home'));
    },
    onExport: () => {
      const address = ownProps.account.id;
      const chain = ownProps.account.blockchain;
      dispatch(addresses.actions.exportKeyFile(chain, address))
        .then((result: any) => {
          saveJson(result, `${chain}-${address}.json`);
        });
    }
  })
)(AccountActionsMenu);
