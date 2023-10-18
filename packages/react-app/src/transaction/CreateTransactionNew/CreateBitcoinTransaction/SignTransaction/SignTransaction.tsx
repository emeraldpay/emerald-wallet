import { BitcoinEntry, UnsignedBitcoinTx, isSeedPkRef } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, transaction } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormLabel, FormRow, PasswordInput } from '@emeraldwallet/ui';
import { Box, CircularProgress, Grid, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../../../ledger/WaitLedger';
import { Summary } from './Summary';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  entry: BitcoinEntry;
  unsigned: UnsignedBitcoinTx;
  onCancel(): void;
  onSign(txId: string, signedTx: string): void;
}

interface StateProps {
  isHardware: boolean;
}

interface DispatchProps {
  signTx(password?: string): Promise<[string, string]>;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const SignTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  entry,
  isHardware,
  unsigned,
  onCancel,
  onSign,
  signTx,
  verifyGlobalKey,
}) => {
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

      if (mounted.current) {
        setVerifying(false);
      }

      if (!correctPassword) {
        setPasswordError('Incorrect password');

        return;
      }
    }

    setSigning(true);

    try {
      const [txId, signedTx] = await signTx(password);

      if (mounted.current) {
        onSign(txId, signedTx);
      }
    } catch (exception) {
      if (mounted.current) {
        setSigning(false);
      }
    }
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

  const blockchain = blockchainIdToCode(entry.blockchain);

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
      ) : (
        <>
          <Summary entry={entry} unsigned={unsigned} />
          {isHardware ? (
            <WaitLedger fullSize blockchain={blockchain} onConnected={handleSignTx} />
          ) : (
            <FormRow>
              <FormLabel>Password</FormLabel>
              <PasswordInput
                error={passwordError}
                minLength={1}
                placeholder="Enter existing password"
                showLengthNotice={false}
                onChange={setPassword}
                onPressEnter={handlePasswordEnter}
              />
            </FormRow>
          )}
        </>
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

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry }) => ({
    isHardware:
      isSeedPkRef(entry, entry.key) &&
      accounts.selectors.isHardwareSeed(state, { type: 'id', value: entry.key.seedId }),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { entry, unsigned }) => ({
    signTx(password) {
      return new Promise((resolve, reject) =>
        dispatch(
          transaction.actions.signBitcoinTransaction(entry.id, unsigned, password, (txId, signedTx) => {
            if (txId == null || signedTx == null) {
              reject();
            } else {
              resolve([txId, signedTx]);
            }
          }),
        ),
      );
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(SignTransaction);
