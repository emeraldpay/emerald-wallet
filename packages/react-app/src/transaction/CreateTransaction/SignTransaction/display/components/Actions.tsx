import { BlockchainCode } from '@emeraldwallet/core';
import { Button, ButtonGroup, FormLabel, FormRow, PasswordInput } from '@emeraldwallet/ui';
import { Box, CircularProgress, Grid, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import WaitLedger from '../../../../../ledger/WaitLedger';

const useStyles = makeStyles(() =>
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  blockchain: BlockchainCode;
  isHardware: boolean;
  onCancel(): void;
  onSignTx(password?: string): Promise<void>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

export const Actions: React.FC<OwnProps> = ({ blockchain, isHardware, onCancel, onSignTx, verifyGlobalKey }) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [signing, setSigning] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);

  const [password, setPassword] = React.useState<string | undefined>();
  const [passwordError, setPasswordError] = React.useState<string | undefined>();

  const handleSignTx = async (): Promise<void> => {
    setPasswordError(undefined);

    if (!isHardware) {
      if (password == null) {
        return;
      }

      setVerifying(true);

      const correctPassword = await verifyGlobalKey(password);

      if (!mounted.current) {
        return;
      }

      if (!correctPassword) {
        setPasswordError('Incorrect password');
      }

      setVerifying(false);
    }

    setSigning(true);

    onSignTx(password).then(() => {
      if (mounted.current) {
        setSigning(false);
      }
    });
  };

  const handlePasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await handleSignTx();
    }
  };

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <>
      {signing ? (
        <Box mb={2}>
          <Grid container alignItems="center" justifyContent="center">
            <Grid item>
              <Box pr={2}>
                <CircularProgress />
              </Box>
            </Grid>
            <Grid item>
              <Typography variant="h5">Signing...</Typography>
              <Typography>Please wait while transaction being signed.</Typography>
            </Grid>
          </Grid>
        </Box>
      ) : isHardware ? (
        <WaitLedger fullSize blockchain={blockchain} onConnected={handleSignTx} />
      ) : (
        <FormRow>
          <FormLabel>Password</FormLabel>
          <PasswordInput
            error={passwordError}
            initialValue={password}
            minLength={1}
            placeholder="Enter existing password"
            showLengthNotice={false}
            onChange={setPassword}
            onPressEnter={handlePasswordEnter}
          />
        </FormRow>
      )}
      <FormRow last>
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Cancel" onClick={onCancel} />
          {!isHardware && !signing && (
            <Button
              primary
              disabled={verifying || (password?.length ?? 0) === 0}
              label="Sign Transaction"
              onClick={handleSignTx}
            />
          )}
        </ButtonGroup>
      </FormRow>
    </>
  );
};
