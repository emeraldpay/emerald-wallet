import { SeedDescription, WatchEvent } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainCodeToId, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, application, screen } from '@emeraldwallet/store';
import { Ledger } from '@emeraldwallet/ui';
import { Box, CircularProgress, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { lt as isLessVersion } from 'semver';

interface OwnProps {
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
  awaitConnection,
  getLedgerMinVersion,
  onConnected,
  showWarning,
}) => {
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
    <Box mb={2}>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item>
          <Box pr={2}>
            <CircularProgress />
          </Box>
        </Grid>
        <Grid item>
          <Typography variant="h5">
            <Ledger alignmentBaseline="middle" /> Waiting for Ledger Nano
          </Typography>
          <Typography>Please connect and unlock your Ledger Nano X or Nano S.</Typography>
        </Grid>
      </Grid>
    </Box>
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
