import { OddPasswordItem } from '@emeraldpay/emerald-vault-core';
import { ButtonGroup, Page } from '@emeraldplatform/ui';
import { accounts, screen } from '@emeraldwallet/store';
import { Button, PasswordInput } from '@emeraldwallet/ui';
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

interface DispatchProps {
  getLegacyItems(): Promise<OddPasswordItem[]>;
  goHome(): Promise<void>;
  goPasswordMigration(): Promise<void>;
  setGlobalKey(password: string): Promise<boolean>;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const GlobalKey: React.FC<DispatchProps & StylesProps> = ({
  classes,
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
        <ButtonGroup>
          <Button label="Skip" onClick={goHome} />
          <Button label="Create" primary={true} onClick={applyPassword} />
        </ButtonGroup>
      </FormFieldWrapper>
      <Typography>
        NOTE: The password is the only way to access your coins. If you lose it, the only way to restore is to
        recover the Wallet from Secret Phrase backup. Please make sure you have it backed up.
      </Typography>
    </Page>
  );
};

export default connect(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any): DispatchProps => (
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
