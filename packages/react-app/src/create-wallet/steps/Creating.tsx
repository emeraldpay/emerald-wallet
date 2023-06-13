import { CircularProgress, Grid, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(
  createStyles({
    aligned: {
      marginBottom: 100,
      marginTop: 100,
    },
    progress: {
      paddingTop: 10,
      textAlign: 'center',
    },
  }),
);

const Creating: React.FC = () => {
  const styles = useStyles();

  return (
    <Grid container className={styles.aligned}>
      <Grid item xs={4} />
      <Grid item className={styles.progress} xs={1}>
        <CircularProgress />
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h5">Creating the wallet</Typography>
        <Typography>Please wait while wallet being initialized.</Typography>
      </Grid>
    </Grid>
  );
};

export default Creating;
