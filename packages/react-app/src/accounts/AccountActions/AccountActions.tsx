import * as React from 'react';
import { connect } from 'react-redux';
import { AccountActionsMenu } from '@emeraldwallet/ui';
import { addresses, txhistory, screen } from '@emeraldwallet/store';
import { BlockchainCode } from '@emeraldwallet/core';
import { saveJson } from '../../util/save-as';

const hasBalance = (account: any): boolean => (account.get('balance', null) === null)
  || (account.get('balance') && account.get('balance').toWei().gt(0));

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
  account: any;
}

const mapStateToProps = (state: any, ownProps: any): PropsFromState => {
  return {
    chain: ownProps.account.get('blockchain'),
    showPrint: !ownProps.account.get('hardware', false),
    showExport: !ownProps.account.get('hardware', false),
    hiddenAccount: ownProps.account.get('hidden'),
    canHide: !hasBalance(ownProps.account),
  };
};

export default connect<PropsFromState, DispatchFromProps, OwnProps>(
  mapStateToProps,
  (dispatch: any, ownProps) => ({
    onPrint: (chain: string) => () => {
      const address = ownProps.account.get('id');
      dispatch(screen.actions.gotoScreen('export-paper-wallet', {address, blockchain: chain}));
    },
    onHide: (chain: string) => () => {
      const address = ownProps.account.get('id');
      dispatch(screen.actions.showDialog('hide-account', {id: address, blockchain: chain}));
    },
    onUnhide: (chain: BlockchainCode) => () => {
      const address = ownProps.account.get('id');
      dispatch(addresses.actions.unhideAccount(chain, address));
      // refresh account data
      dispatch(txhistory.actions.refreshTrackedTransactions());
      dispatch(addresses.actions.loadAccountsList());
      // dispatch(accounts.actions.loadPendingTransactions()); // TODO: do we need it ?

      dispatch(screen.actions.gotoScreen('home'));
    },
    onExport: (chain: BlockchainCode) => () => {
      const address = ownProps.account.get('id');
      dispatch(addresses.actions.exportKeyFile(chain, address))
        .then((result: any) => {
          saveJson(result, `${chain}-${address}.json`);
        });
    },
  })
)(AccountActionsMenu);
