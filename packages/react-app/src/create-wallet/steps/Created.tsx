import { Grid, Typography } from '@mui/material';
import { AssignmentTurnedIn as AssignedIcon } from '@mui/icons-material';
import * as React from 'react';

interface OwnProps {
  walletId: string;
}

const Created: React.FC<OwnProps> = ({ walletId }) => (
  <Grid container>
    <Grid item xs={10}>
      <Typography variant="h4">
        <AssignedIcon /> Wallet created
      </Typography>
      <Typography variant="subtitle2">Wallet ID: {walletId}</Typography>
      <Typography variant="body1">
        The wallet is successfully created. Now you can use it to receive and send cryptocurrency.
      </Typography>
    </Grid>
  </Grid>
);

export default Created;
