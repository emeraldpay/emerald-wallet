import { OddPasswordItem } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { Pages } from '@emeraldwallet/store/lib/screen';
import { Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { Typography, createStyles, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    gutter: {
      marginBottom: 20,
    },
    label: {
      minWidth: 180,
      width: 180,
    },
  }),
);

interface StateProps {
  hasWallets: boolean;
}

interface DispatchProps {
  createWallet(): void;
  getLegacyItems(): Promise<OddPasswordItem[]>;
  goBack(): Promise<void>;
  goHome(): Promise<void>;
  goPasswordMigration(): void;
  setGlobalKey(password: string): Promise<boolean>;
}

const GlobalKey: React.FC<DispatchProps & StateProps> = ({
  hasWallets,
  createWallet,
  getLegacyItems,
  goBack,
  goHome,
  goPasswordMigration,
  setGlobalKey,
}) => {
  const styles = useStyles();

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const applyPassword = React.useCallback(async () => {
    if (password.length > 0 && password === confirmPassword) {
      const complete = await setGlobalKey(password);

      if (complete) {
        const items = await getLegacyItems();

        return (items.length > 0 ? goPasswordMigration : hasWallets ? goHome : createWallet)();
      }
    }
  }, [confirmPassword, hasWallets, password, createWallet, getLegacyItems, goHome, goPasswordMigration, setGlobalKey]);

  return (
    <Page title="Setup You Encryption Password" leftIcon={<Back onClick={goBack} />}>
      {hasWallets && (
        <Alert severity="info" style={{ marginBottom: 15 }}>
          Starting Emerald Wallet v2.6 uses a different schema to store Privates Keys, which is more secure and easier
          to use.
        </Alert>
      )}
      <Typography style={{ marginBottom: 15 }}>
        {hasWallets
          ? 'To begin using the new format, please create a password thatencrypts and protects your private keys and seed phrases stored on your device.'
          : 'Please create a password to secure your wallet. This password encrypts and protects your private keys and seed phrases stored on your device.'}
      </Typography>
      <FormRow>
        <FormLabel classes={{ root: styles.label }}>Password</FormLabel>
        <PasswordInput onChange={(value) => setPassword(value)} />
      </FormRow>
      <FormRow>
        <FormLabel classes={{ root: styles.label }}>Confirm password</FormLabel>
        <PasswordInput onChange={(value) => setConfirmPassword(value)} />
      </FormRow>
      <FormRow>
        <FormLabel classes={{ root: styles.label }} />
        <ButtonGroup classes={{ container: styles.buttons }}>
          {hasWallets && <Button label="Skip" onClick={goHome} />}
          <Button
            label="Create"
            disabled={password.length === 0 || password !== confirmPassword}
            primary={true}
            onClick={applyPassword}
          />
        </ButtonGroup>
      </FormRow>
      <Typography>
        Important:
        This password is crucial for accessing your funds.
        If you forget it, the only way to recover your wallet is through your seed phrase backup.
        Ensure you have both recorded and stored securely.
      </Typography>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, unknown, IState>(
  (state) => ({
    hasWallets: state.accounts.wallets.length > 0,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    createWallet() {
      dispatch(screen.actions.gotoScreen(Pages.CREATE_WALLET));
    },
    getLegacyItems() {
      return dispatch(accounts.actions.getOddPasswordItems());
    },
    goBack() {
      return dispatch(screen.actions.goBack());
    },
    goHome() {
      return dispatch(screen.actions.gotoWalletsScreen());
    },
    goPasswordMigration() {
      dispatch(screen.actions.gotoScreen(screen.Pages.PASSWORD_MIGRATION));
    },
    setGlobalKey(password) {
      return dispatch(accounts.actions.createGlobalKey(password));
    },
  }),
)(GlobalKey);
