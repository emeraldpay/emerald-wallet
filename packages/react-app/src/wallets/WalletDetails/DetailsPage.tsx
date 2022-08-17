import { createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Addresses from './Addresses';
import WalletDetails from './WalletDetails';
import TxHistory from '../../transactions/TxHistory';

export const styles = createStyles({
  transContainer: {
    marginTop: '20px',
  },
});

interface OwnProps {
  walletId: string;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const DetailsPage: React.FC<OwnProps & StylesProps> = ({ classes, walletId }) => {
  return (
    <React.Fragment>
      <WalletDetails walletId={walletId} />
      <div className={classes.transContainer}>
        <TxHistory walletId={walletId} />
      </div>
      <div className={classes.transContainer}>
        <Addresses walletId={walletId} />
      </div>
    </React.Fragment>
  );
};

export default withStyles(styles)(DetailsPage);
