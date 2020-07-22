import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Transactions from './Transactions';
import WalletDetails from './WalletDetails';
import Addresses from "./Addresses";

export const styles = {
  transContainer: {
    marginTop: '20px'
  }
};

function DetailsPage (props: {classes: any, walletId: string}) {
  const { walletId, classes } = props;
  return (
    <React.Fragment>
      <WalletDetails walletId={walletId}/>
      <div className={classes.transContainer}>
        <Transactions walletId={walletId}/>
      </div>
      <div className={classes.transContainer}>
        <Addresses walletId={walletId}/>
      </div>
    </React.Fragment>
  );
}

export default withStyles(styles)(DetailsPage);
