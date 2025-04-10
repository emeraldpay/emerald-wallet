import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { connect } from 'react-redux';
import WalletItem from './WalletItem';

const useStyles = makeStyles()({
  container: {
    maxHeight: '100%',
    overflowY: 'auto',
  },
});

interface StateProps {
  wallets: Wallet[];
}

interface DispatchProps {
  openWallet(wallet: Wallet): void;
}

const WalletList: React.FC<StateProps & DispatchProps> = ({ wallets, openWallet }) => {
  const { classes: styles } = useStyles();

  return (
    <div className={styles.container}>
      {wallets.map((wallet: Wallet) => {
        return <WalletItem key={wallet.id} wallet={wallet} openWallet={openWallet} />;
      })}
    </div>
  );
};

export default connect<StateProps, DispatchProps, unknown, IState>(
  (state) => ({
    wallets: accounts.selectors.allWallets(state),
  }),
  (dispatch) => ({
    openWallet(wallet) {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, wallet.id));
    },
  }),
)(WalletList);
