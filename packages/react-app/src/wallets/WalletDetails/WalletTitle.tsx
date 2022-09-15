import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IState, accounts } from '@emeraldwallet/store';
import { InlineEdit } from '@emeraldwallet/ui';
import { Pen3 as EditIcon } from '@emeraldwallet/ui/lib/icons';
import { IconButton, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      alignItems: 'center',
      display: 'flex',
    },
    button: {
      marginLeft: theme.spacing(),
    },
  }),
);

interface OwnProps {
  walletId: string;
}

interface StateProps {
  wallet?: Wallet;
}

interface DispatchProps {
  updateWallet(data: Partial<Wallet>): void;
}

const WalletTitle: React.FC<OwnProps & StateProps & DispatchProps> = ({ wallet, updateWallet }) => {
  const styles = useStyles();

  const [edit, setEdit] = React.useState(false);

  const onSave = React.useCallback(
    ({ id, value }) => {
      updateWallet({ id, name: value });
      setEdit(false);
    },
    [updateWallet],
  );

  return edit ? (
    <InlineEdit
      id={wallet?.id}
      initialValue={wallet?.name ?? ''}
      placeholder="Wallet name"
      onCancel={() => setEdit(false)}
      onSave={onSave}
    />
  ) : (
    <div className={styles.container}>
      <Typography>{wallet?.name}</Typography>
      <IconButton className={styles.button} onClick={() => setEdit(true)}>
        <EditIcon />
      </IconButton>
    </div>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => ({
    wallet: accounts.selectors.findWallet(state, ownProps.walletId),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    updateWallet(data) {
      if (data.id != null) {
        dispatch(accounts.actions.updateWallet(data.id, data.name ?? ''));
      }
    },
  }),
)(WalletTitle);
