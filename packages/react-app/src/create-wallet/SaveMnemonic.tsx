import { accounts } from '@emeraldwallet/store';
import { Button, PasswordInput } from '@emeraldwallet/ui';
import { Grid, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  onPassword: (encryptionPassword: string) => void;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
}

const SaveMnemonic: React.FC<DispatchProps & OwnProps> = ({ checkGlobalKey, onPassword }) => {
  const [password, setPassword] = React.useState('');

  const [passwordError, setPasswordError] = React.useState<string>();

  const onVerifyPassword = React.useCallback(async () => {
    setPasswordError(undefined);

    const correctPassword = await checkGlobalKey(password);

    if (correctPassword) {
      onPassword(password);
    } else {
      setPasswordError('Incorrect password');
    }
  }, [password]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant={'h4'}>Save Secret Phrase</Typography>
        <Alert severity="info">
          You&apos;re about to save an encrypted copy of the secret phrase (&quot;Mnemonic Phrase&quot;) generated on
          the previous step. Please enter the Emerald Wallet password to save the Seed Phrase!
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={10}>
            <PasswordInput error={passwordError} minLength={1} onChange={setPassword} />
          </Grid>
          <Grid item xs={2}>
            <Button label="Save" primary={true} onClick={onVerifyPassword} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default connect<{}, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(SaveMnemonic);
