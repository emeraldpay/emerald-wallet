import { Blockchains, IAccount } from '@emeraldwallet/core';
import { addresses, screen } from '@emeraldwallet/store';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import Account from './AccountItem';

const styles = (theme: any) => ({
  container: {
    marginBottom: '10px'
  },
  hiddenListItem: {
    border: `1px solid ${theme.palette.divider}`,
    opacity: 0.4,
    marginBottom: '10px'
  },
  listItem: {
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: '10px'
  }
});

interface IAccountListProps {
  showFiat: boolean;
  accounts: any;
  classes: any;
  openAccount: any;
  createTx: any;
  showReceiveDialog: any;
}

const AccountList = ((props: IAccountListProps) => {
  const {
    accounts, showFiat, classes
  } = props;
  const {
    openAccount, createTx, showReceiveDialog
  } = props;
  return (
    <div className={classes.container}>
      {accounts.map((account: any) => {
        const className = account.get('hidden') ? classes.hiddenListItem : classes.listItem;
        return (<div className={className} key={`${account.get('blockchain')}-${account.get('id')}`}>
          <Account
            showFiat={showFiat}
            account={account.toJS()}
            openAccount={openAccount}
            createTx={createTx}
            showReceiveDialog={showReceiveDialog}
          />
        </div>);
      })}
    </div>
  );
});

const StyledAccountList = withStyles(styles)(AccountList);

export default connect(
  (state, ownProps) => {
    return {
      accounts: addresses.selectors.all(state),
      showFiat: true
    };
  },
  (dispatch, ownProps) => ({
    createTx: (account: any) => {
      dispatch(screen.actions.gotoScreen('create-tx', account));
    },
    openAccount: (account: any) => {
      dispatch(screen.actions.gotoScreen('account', account));
    },
    showReceiveDialog: (account: IAccount) => {
      const address = {
        coinTicker: Blockchains[account.blockchain].params.coinTicker,
        value: account.id
      };
      dispatch(screen.actions.showDialog('receive', address));
    }
  })
)((StyledAccountList));
