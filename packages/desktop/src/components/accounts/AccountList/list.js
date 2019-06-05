import React from 'react';
import {Blockchains} from '@emeraldwallet/core';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/styles';
import {connect} from 'react-redux';
import Immutable from 'immutable';
import {translate} from 'react-i18next';
import {screen} from '../../../store';
import launcher from '../../../store/launcher';
import Account from './account';

const styles = (theme) => ({
  container: {
    marginBottom: '10px',
  },
  listItem: {
    marginBottom: '10px',
    border: `1px solid ${theme.palette.divider}`,
  },
  hiddenListItem: {
    opacity: 0.4,
    marginBottom: '10px',
    border: `1px solid ${theme.palette.divider}`,
  },
});

const AccountList = translate('accounts')((props) => {
  const {
    accounts, showFiat, classes,
  } = props;
  const {
    openAccount, createTx, showReceiveDialog,
  } = props;
  return (
    <div className={classes.container}>
      {accounts.map((account) => {
        const className = account.get('hidden') ? classes.hiddenListItem : classes.listItem;
        return (<div className={className} key={account.get('id')}>
          <Account
            showFiat={showFiat}
            account={account}
            openAccount={openAccount}
            createTx={createTx}
            showReceiveDialog={showReceiveDialog}
          />
        </div>);
      })}
    </div>
  );
});

AccountList.propTypes = {
  showFiat: PropTypes.bool,
  accounts: PropTypes.object.isRequired,
};

const StyledAccountList = withStyles(styles)(AccountList);

export default connect(
  (state, ownProps) => {
    return {
      accounts: state.accounts.get('accounts', Immutable.List()),
      showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
    };
  },
  (dispatch, ownProps) => ({
    openAccount: (account) => {
      dispatch(screen.actions.gotoScreen('account', account));
    },
    createTx: (account) => {
      dispatch(screen.actions.gotoScreen('create-tx', account));
    },
    showReceiveDialog: (account) => {
      const address = {
        value: account.get('id'),
        coinTicker: Blockchains[account.get('blockchain')].params.coinTicker,
      };
      dispatch(screen.actions.showDialog('receive', address));
    },
  })
)((StyledAccountList));
