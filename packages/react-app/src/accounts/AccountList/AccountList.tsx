import * as React from 'react';
import {Blockchains} from '@emeraldwallet/core';
import {withStyles} from '@material-ui/styles';
import {connect} from 'react-redux';
import {screen, addresses} from '@emeraldwallet/store';
import Account from './AccountItem';

const styles = (theme: any) => ({
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
    accounts, showFiat, classes,
  } = props;
  const {
    openAccount, createTx, showReceiveDialog,
  } = props;
  return (
    <div className={classes.container}>
      {accounts.map((account: any) => {
        const className = account.get('hidden') ? classes.hiddenListItem : classes.listItem;
        return (<div className={className} key={`${account.get('blockchain')}-${account.get('id')}`}>
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


const StyledAccountList = withStyles(styles)(AccountList);

export default connect(
  (state, ownProps) => {
    return {
      accounts: addresses.selectors.all(state),
      showFiat: true,
    };
  },
  (dispatch, ownProps) => ({
    openAccount: (account: any) => {
      dispatch(screen.actions.gotoScreen('account', account));
    },
    createTx: (account: any) => {
      dispatch(screen.actions.gotoScreen('create-tx', account));
    },
    showReceiveDialog: (account: any) => {
      const address = {
        value: account.get('id'),
        coinTicker: Blockchains[account.get('blockchain')].params.coinTicker,
      };
      dispatch(screen.actions.showDialog('receive', address));
    },
  })
)((StyledAccountList));
