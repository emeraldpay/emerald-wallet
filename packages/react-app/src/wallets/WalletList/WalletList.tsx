import { Wallet } from '@emeraldwallet/core';
import { accounts, IState, screen } from '@emeraldwallet/store';
import { Grid, withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import WalletItem from './WalletItem';

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
    // border: `1px solid ${theme.palette.divider}`,
    // marginBottom: '10px'
  }
});

interface IWalletsListProps {
  wallets: Wallet[];
  classes: any;
  openWallet: (wallet: Wallet) => void;
}

const WalletList = ((props: IWalletsListProps) => {
  const {
    wallets, classes
  } = props;
  const {
    openWallet,
  } = props;
  return (
    <div className={classes.container}>
      <Grid container={true}>
        {wallets.map((wallet: Wallet) => {
          return (
              <WalletItem
                key={wallet.id}
                wallet={wallet}
                openWallet={openWallet}
              />
          );
        })}
      </Grid>
    </div>
  );
});

const StyledAccountList = withStyles(styles)(WalletList);

export default connect(
  (state: IState, ownProps) => {
    return {
      wallets: accounts.selectors.allWallets(state),
    };
  },
  (dispatch, ownProps) => ({
    openWallet: (wallet: Wallet) => {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
    },
  })
)((StyledAccountList));
