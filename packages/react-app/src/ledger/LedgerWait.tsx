import { SeedDescription } from '@emeraldpay/emerald-vault-core';
import { hwkey } from '@emeraldwallet/store';
import { Ledger } from '@emeraldwallet/ui';
import { CircularProgress, Grid, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles(
  createStyles({
    fullSize: {
      marginBottom: 120,
      marginTop: 120,
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

interface DispatchProps {
  awaitConnection(): void;
}

interface OwnProps {
  fullSize?: boolean;
  onConnected(seed: SeedDescription): void;
}

const Component: React.FC<DispatchProps & OwnProps> = ({ fullSize = false, awaitConnection }) => {
  const styles = useStyles();

  React.useEffect(
    () => {
      awaitConnection();
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
        <Typography variant={'h5'}>
          <Ledger /> Waiting for Ledger Nano
        </Typography>
        <Typography>Please connect and unlock your Ledger Nano X or Nano S.</Typography>
      </Grid>
    </Grid>
  );
};

export default connect<unknown, DispatchProps, OwnProps>(null, (dispatch, { onConnected }) => ({
  awaitConnection() {
    dispatch(hwkey.actions.setWatch(true));

    hwkey.triggers.onConnect(() => {
      dispatch(hwkey.actions.setWatch(false));

      onConnected({
        available: true,
        createdAt: new Date(),
        type: 'ledger',
      });
    });
  },
}))(Component);
