import { SeedDescription, WatchEvent } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainCodeToId, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, application, screen } from '@emeraldwallet/store';
import { Ledger } from '@emeraldwallet/ui';
import { CircularProgress, Grid, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import { lt as isLessVersion } from 'semver';

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

interface StateProps {
  getLedgerMinVersion(blockchain: BlockchainCode): string | undefined;
}

interface DispatchProps {
  awaitConnection(): Promise<WatchEvent>;
  showWarning(message: string): void;
}

const WaitLedger: React.FC<StateProps & DispatchProps & OwnProps> = ({
  fullSize = false,
  awaitConnection,
  getLedgerMinVersion,
  onConnected,
  showWarning,
}) => {
  const styles = useStyles();

  React.useEffect(
    () => {
      let mounted = true;

      awaitConnection().then((event) => {
        if (mounted) {
          event.devices.forEach(({ blockchains, device }) => {
            if (device?.app != null && device?.appVersion != null) {
              const [blockchain] = blockchains;

              if (blockchain == null) {
                return;
              }

              const { app: appName, appVersion } = device;

              const requiredVersion = getLedgerMinVersion(blockchainIdToCode(blockchain)) ?? '0.0.0';

              if (isLessVersion(appVersion, requiredVersion)) {
                showWarning(
                  `Please upgrade applications on your Ledger Nano \
                  as your Ledger application "${appName} v${appVersion}" is outdated, \
                  which may result in limited functionality and unsupported features.`,
                );
              }
            }
          });

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

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => ({
    getLedgerMinVersion(blockchain) {
      return application.selectors.getLedgerMinVersion(state, blockchain);
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { blockchain }) => ({
    async awaitConnection() {
      if (blockchain == null) {
        const current: WatchEvent = await dispatch(accounts.actions.watchHardwareConnection({ type: 'get-current' }));

        const { devices, version } = current;

        if (devices.length === 0) {
          return dispatch(accounts.actions.watchHardwareConnection({ version, type: 'change' }));
        }

        return current;
      }

      return dispatch(
        accounts.actions.watchHardwareConnection({
          blockchain: blockchainCodeToId(blockchain),
          type: 'available',
        }),
      );
    },
    showWarning(message) {
      dispatch(screen.actions.showNotification(message, 'warning', 10));
    },
  }),
)(WaitLedger);
