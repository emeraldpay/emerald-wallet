import { CircularProgress, Grid, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()({
  aligned: {
    marginBottom: 100,
    marginTop: 100,
  },
  progress: {
    paddingTop: 10,
    textAlign: 'center',
  },
});

const Creating: React.FC = () => {
  const { classes } = useStyles();

  return (
    <Grid container className={classes.aligned}>
      <Grid item xs={4} />
      <Grid item className={classes.progress} xs={1}>
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
