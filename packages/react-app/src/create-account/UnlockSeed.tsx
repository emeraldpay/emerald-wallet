import { Uuid } from '@emeraldpay/emerald-vault-core';
import { accounts } from '@emeraldwallet/store';
import { Button, PasswordInput } from '@emeraldwallet/ui';
import { Box, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  seedId: Uuid;
  onUnlock(password: string): void;
}

interface DispatchProps {
  verifyPassword(password: string): Promise<boolean>;
}

const UnlockSeed: React.FC<OwnProps & DispatchProps> = ({ seedId, onUnlock, verifyPassword }) => {
  const mounted = React.useRef(true);

  const [verifying, setVerifying] = React.useState(false);

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const onVerify = async (): Promise<void> => {
    if (password == null) {
      return;
    }

    setPasswordError(undefined);
    setVerifying(true);

    const correctPassword = await verifyPassword(password);

    if (correctPassword) {
      onUnlock(password);
    } else {
      setPasswordError('Invalid password');
    }

    if (mounted.current) {
      setVerifying(false);
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await onVerify();
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
        <Typography variant="h5">Password to unlock seed</Typography>
        <Typography>Please provide password to unlock seed {seedId}</Typography>
      </Grid>
      <Grid item xs={12}>
        <Box mt={2}>
          <Grid container alignItems="center" spacing={1}>
            <Grid item xs>
              <PasswordInput
                autoFocus
                disabled={verifying}
                error={passwordError}
                placeholder="Enter existing password"
                minLength={1}
                showLengthNotice={false}
                onChange={setPassword}
                onPressEnter={onPasswordEnter}
              />
            </Grid>
            <Grid item xs="auto">
              <Button primary disabled={verifying || (password?.length ?? 0) === 0} label="Unlock" onClick={onVerify} />
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default connect<unknown, DispatchProps, OwnProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { seedId }): DispatchProps => ({
    verifyPassword(password) {
      return new Promise((resolve) => dispatch(accounts.actions.unlockSeed(seedId, password, resolve)));
    },
  }),
)(UnlockSeed);
