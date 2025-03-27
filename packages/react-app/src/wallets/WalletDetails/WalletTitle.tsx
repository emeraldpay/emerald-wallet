import { Uuid } from '@emeraldpay/emerald-vault-core';
import { IState, accounts } from '@emeraldwallet/store';
import { HashIcon } from '@emeraldwallet/ui';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles()((theme) =>
  ({
    container: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
    },

    walletIcon: {
      cursor: 'default',
      marginRight: theme.spacing(),
      userSelect: 'none',
    },

    walletImage: {
      display: 'inline-block',
      height: 24,
      marginRight: theme.spacing(),
      width: 24,
    }
  }));

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  walletIcon?: string | null;
  walletName?: string;
}

const WalletTitle: React.FC<OwnProps & StateProps> = ({ walletIcon, walletName, walletId }) => {
  const { classes: styles } = useStyles();

  return (
    <div className={styles.container}>
      {walletIcon == null ? (
        <HashIcon className={styles.walletIcon} value={`WALLET/${walletId}`} size={24} />
      ) : (
        <img alt="Wallet Icon" className={styles.walletImage} src={`data:image/png;base64,${walletIcon}`} />
      )}
      <Typography>{walletName}</Typography>
    </div>
  );
};

export default connect<StateProps, unknown, OwnProps, IState>((state, { walletId }) => ({
  walletIcon: state.accounts.icons[walletId],
  walletName: accounts.selectors.findWallet(state, walletId)?.name,
}))(WalletTitle);
