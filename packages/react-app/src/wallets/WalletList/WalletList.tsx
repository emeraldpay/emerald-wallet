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
  showFiat: boolean;
  wallets: Wallet[];
  classes: any;
  openWallet: (wallet: Wallet) => void;
  createTx: (wallet: Wallet) => void;
  showReceiveDialog: (wallet: Wallet) => void;
}

const WalletList = ((props: IWalletsListProps) => {
  const {
    wallets, showFiat, classes
  } = props;
  const {
    openWallet, createTx, showReceiveDialog
  } = props;
  return (
    <div className={classes.container}>
      <Grid container={true}>
        {wallets.map((wallet: Wallet) => {
          return (
              <WalletItem
                key={wallet.id}
                showFiat={showFiat}
                wallet={wallet}
                openWallet={openWallet}
                createTx={createTx}
                showReceiveDialog={showReceiveDialog}
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
      showFiat: true
    };
  },
  (dispatch, ownProps) => ({
    createTx: (wallet: Wallet) => {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, wallet));
    },
    openWallet: (wallet: Wallet) => {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
    },
    showReceiveDialog: (account: Wallet) => {
      // TODO vault v3
      //   const address = {
      //     coinTicker: Blockchains[account.blockchain].params.coinTicker,
      //     value: account.id
      //   };
      //   dispatch(screen.actions.showDialog('receive', address));
    }
  })
)((StyledAccountList));
