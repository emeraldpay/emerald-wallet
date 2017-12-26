import React from 'react';
import { connect } from 'react-redux';
import { IconMenu, IconButton, MenuItem } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import MoreHorizIcon from 'material-ui/svg-icons/navigation/more-horiz';
import FontIcon from 'material-ui/FontIcon';
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
      leftIcon={<FontIcon style={ iconStyle } className="fa fa-eye-slash"/>}
      primaryText='HIDE'
      onTouchTap={ onHide(chain) }/>
  );
};

const renderUnhide = (chain, account, onUnhide) => {
  return (
    <MenuItem
      leftIcon={<FontIcon className="fa fa-eye"/>}
      primaryText='UNHIDE'
      onTouchTap={ onUnhide(chain) }/>
  );
};

const SecondaryMenu = ({ account, onPrint, onExport, onHide, onUnhide, chain, muiTheme }) => {
  const colors = {
    textColor: muiTheme.palette.textColor,
    disabledColor: muiTheme.palette.disabledColor,
  };
  const isHardware = account.get('hardware', false);
  return (
    <IconMenu iconButtonElement={<IconButton><MoreHorizIcon /></IconButton>}>
      {!isHardware &&
            <MenuItem
              leftIcon={<FontIcon className="fa fa-hdd-o"/>}
              primaryText='EXPORT'
              onTouchTap={ onExport(chain) }/> }
      {!isHardware &&
            <MenuItem
              leftIcon={<FontIcon className="fa fa-print"/>}
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
