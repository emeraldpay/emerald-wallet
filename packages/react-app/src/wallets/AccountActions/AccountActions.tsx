import { BlockchainCode } from '@emeraldwallet/core';
import { accounts, screen } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import { saveJson } from '../../util/save-as';
import AccountActionsMenu from './AccountActionsMenu';

interface IPropsFromState {
  hiddenAccount: boolean;
  canHide: boolean;
  showPrint: boolean;
  showExport: boolean;
}

interface IOwnProps {
  account: any;
}

interface IDispatchProps {
  onPrint: any;
}

const mapStateToProps = (state: any, ownProps: IOwnProps): IPropsFromState => {
  return {
    hiddenAccount: false,
    showExport: true,
    showPrint: true,
    canHide: false
  };
};

export default connect<IPropsFromState, IDispatchProps, IOwnProps, {}>(
  mapStateToProps,
  (dispatch: any, ownProps: IOwnProps) => ({
    onPrint: () => {
      const address = ownProps.account.id;
      const chain = ownProps.account.blockchain;
      dispatch(screen.actions.gotoScreen('export-paper-wallet', ownProps.account));
    },
    onExport: () => {
      const accountId = ownProps.account.id;
      const chain = ownProps.account.blockchain;
      dispatch(accounts.actions.exportKeyFile(accountId))
        .then((result: any) => {
          saveJson(result, `${chain}-${ownProps.account.address}.json`);
        });
    }
  })
)(AccountActionsMenu);
