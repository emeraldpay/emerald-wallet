import { createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Addresses from './Addresses';
import Transactions from './Transactions';
import WalletDetails from './WalletDetails';

export const styles = createStyles({
  transContainer: {
    marginTop: '20px',
  },
});

interface OwnProps {
  classes: Record<keyof typeof styles, string>;
  walletId: string;
}

const DetailsPage: React.FC<OwnProps> = ({ walletId, classes }) => (
  <React.Fragment>
    <WalletDetails walletId={walletId} />
    <div className={classes.transContainer}>
      <Transactions walletId={walletId} />
    </div>
    <div className={classes.transContainer}>
      <Addresses walletId={walletId} />
    </div>
  </React.Fragment>
);

export default withStyles(styles)(DetailsPage);
