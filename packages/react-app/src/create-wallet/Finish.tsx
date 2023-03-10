import { Grid, Typography } from '@material-ui/core';
import { AssignmentTurnedIn as AssignedIcon } from '@material-ui/icons';
import * as React from 'react';

interface OwnProps {
  id: string;
}

/**
 * Final screen for a wallet creation. Provides info and a button to go to the newly created wallet.
 */
const Finish: React.FC<OwnProps> = ({ id }) => (
  <Grid container>
    <Grid item xs={10}>
      <Typography variant="h4">
        <AssignedIcon /> Wallet created
      </Typography>
      <Typography variant="subtitle2">Wallet ID: {id}</Typography>
      <Typography variant="body1">
        The wallet is successfully created. Now you can use it to receive and send cryptocurrency.
      </Typography>
    </Grid>
  </Grid>
);

export default Finish;
