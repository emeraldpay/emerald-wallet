import React from 'react';
import { connect } from 'react-redux';
import { IconMenu, IconButton, MenuItem } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Print as PrintIcon, Export as ExportIcon, ViewVisible as ViewVisibleIcon, ViewHidden as ViewHiddenIcon, MoreHorizontal as MoreHorizontalIcon } from 'emerald-js-ui/lib/icons3';
import { api } from 'lib/rpc/api';
import saveAs from 'lib/saveAs';
import screen from '../../../store/wallet/screen';
import history from '../../../store/wallet/history';
import accounts from '../../../store/vault/accounts';

const hasBalance = (account) => (account.get('balance', null) === null) ||
  (account.get('balance') && account.get('balance').value().gt(0));

const renderHide = (chain, account, onHide, { disabledColor }) => {
  const disabled = hasBalance(account);
  const iconStyle = disabled ? {
    color: disabledColor,
  } : null;
  return (
    <MenuItem
      disabled={ disabled }
      leftIcon={<ViewHiddenIcon style={iconStyle} />}
      primaryText='HIDE'
      onClick={ onHide(chain) }/>
  );
};

const renderUnhide = (chain, account, onUnhide) => {
  return (
    <MenuItem
      leftIcon={<ViewVisibleIcon />}
      primaryText='UNHIDE'
      onClick={ onUnhide(chain) }/>
  );
};

export const SecondaryMenu = ({ account, onPrint, onExport, onHide, onUnhide, chain, muiTheme }) => {
  const colors = {
    textColor: muiTheme.palette.textColor,
    disabledColor: muiTheme.palette.disabledColor,
  };
  const isHardware = account.get('hardware', false);
  return (
    <IconMenu iconButtonElement={<IconButton><MoreHorizontalIcon /></IconButton>}>
      {!isHardware &&
            <MenuItem
              leftIcon={<ExportIcon />}
              primaryText='EXPORT'
              onTouchTap={ onExport(chain) }/> }
      {!isHardware &&
            <MenuItem
              leftIcon={<PrintIcon />}
              primaryText='PRINT'
              onTouchTap={ onPrint(chain) }/> }

      { !account.get('hidden') && renderHide(chain, account, onHide, colors) }
      { account.get('hidden') && renderUnhide(chain, account, onUnhide) }

    </IconMenu>
  );
};

export default connect(
  (state, ownProps) => ({
    chain: state.launcher.getIn(['chain', 'name']),
  }),
  (dispatch, ownProps) => ({
    onPrint: (chain) => () => {
      const address = ownProps.account.get('id');
      dispatch(screen.actions.gotoScreen('export-paper-wallet', address));
    },
    onHide: (chain) => () => {
      const address = ownProps.account.get('id');
      dispatch(screen.actions.showDialog('hide-account', address));
    },
    onUnhide: (chain) => () => {
      const address = ownProps.account.get('id');
      dispatch(accounts.actions.unhideAccount(address));
      // refresh account data
      dispatch(history.actions.refreshTrackedTransactions());
      dispatch(accounts.actions.loadAccountsList());
      dispatch(accounts.actions.loadPendingTransactions());

      dispatch(screen.actions.gotoScreen('home'));
    },
    onExport: (chain) => () => {
      const address = ownProps.account.get('id');

      api.emerald.exportAccount(address, chain).then((result) => {
        const fileData = {
          filename: `${address}.json`,
          mime: 'text/plain',
          contents: result,
        };

        const blob = new Blob([fileData.contents], {type: fileData.mime});
        const url = URL.createObjectURL(blob);
        saveAs(url, fileData.filename);
      });
    },
  })
)(muiThemeable()(SecondaryMenu));

