import { Wallet } from '@emeraldwallet/core';
import { IState } from '@emeraldwallet/store';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import * as React from 'react';
import { connect } from 'react-redux';
import WalletSummary from '../wallets/WalletSummary';

interface IOwnProps {
  wallet: Wallet;
}

interface IRenderProps {
  wallet: Wallet;
}

interface IDispatchProps {
}

const SelectWallet = ((props: IRenderProps & IDispatchProps) => {
  const { wallet } = props;

  return (
      <Grid container={true}>
        <Grid item={true} xs={12}>
          <Typography title={wallet.name}>
            Adding a support for a new cryptocurrency to the wallet "{wallet.name}"
          </Typography>
        </Grid>
        <Grid item={true} xs={12}>
          <WalletSummary wallet={wallet}/>
        </Grid>
      </Grid>
  );
});

export default connect<IRenderProps, IDispatchProps, IOwnProps, IState>(
  (state, ownProps) => {
    return {
      wallet: ownProps.wallet
    };
  },
  (dispatch, ownProps) => {
    return {
    };
  }
)((SelectWallet));
