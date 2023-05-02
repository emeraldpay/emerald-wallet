import { SeedDescription, WatchEvent } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { accounts } from '@emeraldwallet/store';
import { Ledger } from '@emeraldwallet/ui';
import { CircularProgress, Grid, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles(
  createStyles({
    fullSize: {
      marginBottom: 100,
      marginTop: 100,
    },
    progress: {
      paddingTop: 10,
      textAlign: 'center',
    },
    icon: {
      fontSize: '4em',
    },
  }),
);

interface OwnProps {
  fullSize?: boolean;
  blockchain?: BlockchainCode;
  onConnected(seed: SeedDescription): void;
}

interface DispatchProps {
  awaitConnection(): Promise<void>;
}

const WaitLedger: React.FC<DispatchProps & OwnProps> = ({ fullSize = false, awaitConnection, onConnected }) => {
  const styles = useStyles();

  React.useEffect(
    () => {
      let mounted = true;

      awaitConnection().then(() => {
        if (mounted) {
          onConnected({
            available: true,
            createdAt: new Date(),
            type: 'ledger',
          });
        }
      });

      return () => {
        mounted = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Grid container className={fullSize ? styles.fullSize : ''}>
      {fullSize && <Grid item xs={2} />}
      <Grid item className={styles.progress} xs={1}>
        <CircularProgress />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h5">
          <Ledger /> Waiting for Ledger Nano
        </Typography>
        <Typography>Please connect and unlock your Ledger Nano X or Nano S.</Typography>
      </Grid>
    </Grid>
  );
};

export default connect<unknown, DispatchProps, OwnProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { blockchain }) => ({
    async awaitConnection() {
      if (blockchain == null) {
        const { devices, version }: WatchEvent = await dispatch(
          accounts.actions.watchHardwareConnection({ type: 'get-current' }),
        );

        if (devices.length === 0) {
          await dispatch(accounts.actions.watchHardwareConnection({ version, type: 'change' }));
        }
      } else {
        await dispatch(
          accounts.actions.watchHardwareConnection({
            blockchain: blockchainCodeToId(blockchain),
            type: 'available',
          }),
        );
      }
    },
  }),
)(WaitLedger);
