import { OddPasswordItem } from '@emeraldpay/emerald-vault-core';
import { ButtonGroup, Page } from '@emeraldplatform/ui';
import { accounts, IState, screen } from '@emeraldwallet/store';
import { Button, PasswordInput } from '@emeraldwallet/ui';
import { OwnProps } from '@emeraldwallet/ui/lib/components/accounts/Balance/Balance';
import { createStyles, Typography, withStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import FormFieldWrapper from '../../../transaction/CreateTx/FormFieldWrapper';
import FormLabel from '../../../transaction/CreateTx/FormLabel';

const styles = createStyles({
  gutter: {
    marginBottom: 20,
  },
  label: {
    minWidth: 180,
    width: 180,
  },
});

interface StateProps {
  hasWallets: boolean;
}

interface DispatchProps {
  getLegacyItems(): Promise<OddPasswordItem[]>;
  goHome(): Promise<void>;
  goPasswordMigration(): Promise<void>;
  setGlobalKey(password: string): Promise<boolean>;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

interface ButtonsProps {
  confirmPassword: string;
  hasWallets: boolean;
  password: string;
  applyPassword(): void;
  goHome(): Promise<void>;
}

const Buttons: React.FC<ButtonsProps> = ({ confirmPassword, hasWallets, password, applyPassword, goHome }) => {
  const applyButton = <Button
    label="Create"
    disabled={password.length === 0 || password !== confirmPassword}
    primary={true}
    onClick={applyPassword}
  />;

  if (hasWallets) {
    return (
      <ButtonGroup>
        <Button label="Skip" onClick={goHome} />
        {applyButton}
      </ButtonGroup>
    );
  }

  return applyButton;
}

const GlobalKey: React.FC<DispatchProps & StateProps & StylesProps> = ({
  classes,
  hasWallets,
  getLegacyItems,
  goHome,
  goPasswordMigration,
  setGlobalKey,
}) => {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const applyPassword = React.useCallback(async () => {
    if (password.length > 0 && password === confirmPassword) {
      const complete = await setGlobalKey(password);

      if (complete) {
        const items = await getLegacyItems();

        return (
          items.length > 0
            ? goPasswordMigration
            : goHome
        )();
      }
    }
  }, [password, confirmPassword]);

  return (
    <Page title="Setup Global Key">
      <Alert severity="info" style={{ marginBottom: 15 }}>
        Starting Emerald Wallet v2.6 uses a different schema to store Privates Keys, which is more secure and easier to
        use.
      </Alert>
      <Typography style={{ marginBottom: 15 }}>
        To begin using the new format, please create a new key that will encrypt all of your Private Keys.
      </Typography>
      <FormFieldWrapper>
        <FormLabel classes={{ root: classes.label }}>Global password</FormLabel>
        <PasswordInput onChange={(value) => setPassword(value)} />
      </FormFieldWrapper>
      <FormFieldWrapper>
        <FormLabel classes={{ root: classes.label }}>Confirm password</FormLabel>
        <PasswordInput onChange={(value) => setConfirmPassword(value)} />
      </FormFieldWrapper>
      <FormFieldWrapper>
        <FormLabel classes={{ root: classes.label }} />
        <Buttons
          confirmPassword={confirmPassword}
          hasWallets={hasWallets}
          password={password}
          applyPassword={applyPassword}
          goHome={goHome}
        />
      </FormFieldWrapper>
      <Typography>
        NOTE: The password is the only way to access your coins. If you lose it, the only way to restore is to
        recover the Wallet from Secret Phrase backup. Please make sure you have it backed up.
      </Typography>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => (
    {
      hasWallets: state.accounts.wallets.length > 0,
    }
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => (
    {
      getLegacyItems() {
        return dispatch(accounts.actions.getOddPasswordItems());
      },
      goHome() {
        return dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
      },
      goPasswordMigration() {
        return dispatch(screen.actions.gotoScreen(screen.Pages.PASSWORD_MIGRATION));
      },
      setGlobalKey(password) {
        return dispatch(accounts.actions.createGlobalKey(password));
      },
    }
  ),
)(withStyles(styles)(GlobalKey));
