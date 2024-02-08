import { IState, accounts } from '@emeraldwallet/store';
import { Button, PasswordInput } from '@emeraldwallet/ui';
import { Grid, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  onPassword: (encryptionPassword: string) => void;
}

interface DispatchProps {
  verifyGlobalKey(password: string): Promise<boolean>;
}

const SaveMnemonic: React.FC<DispatchProps & OwnProps> = ({ onPassword, verifyGlobalKey }) => {
  const mounted = React.useRef(true);

  const [verifying, setVerifying] = React.useState(false);

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const onVerifyPassword = async (): Promise<void> => {
    if (password == null) {
      return;
    }

    setPasswordError(undefined);
    setVerifying(true);

    const correctPassword = await verifyGlobalKey(password);

    if (correctPassword) {
      onPassword(password);
    } else {
      setPasswordError('Incorrect password');
    }

    if (mounted.current) {
      setVerifying(false);
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await onVerifyPassword();
    }
  };

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography style={{ marginBottom: 10 }} variant="h4">
          Enter your password
        </Typography>
        <Alert severity="info">
          You will now save an encrypted version of your seed phrase.
          Please enter your Emerald Wallet password to securely encrypt and store your seed phrase.
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={10}>
            <PasswordInput
              error={passwordError}
              minLength={1}
              placeholder="Enter existing password"
              showLengthNotice={false}
              onChange={setPassword}
              onPressEnter={onPasswordEnter}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              primary
              disabled={verifying || (password?.length ?? 0) === 0}
              label="Save"
              onClick={onVerifyPassword}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default connect<unknown, DispatchProps, OwnProps, IState>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(SaveMnemonic);
