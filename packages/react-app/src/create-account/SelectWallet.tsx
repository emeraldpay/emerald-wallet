import { WalletOp } from '@emeraldpay/emerald-vault-core';
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

interface OwnProps {
  wallet: WalletOp;
}

interface RenderProps {
  wallet: WalletOp;
}

interface DispatchProps {
}

const SelectWallet = ((props: RenderProps & DispatchProps) => {
  const { wallet } = props;

  return (
      <Grid container={true}>
        <Grid item={true} xs={12}>
          <Typography title={wallet.value.name}>
            Adding a support for a new cryptocurrency to the wallet "{wallet.value.name}"
          </Typography>
        </Grid>
        <Grid item={true} xs={12}>
          <WalletSummary wallet={wallet.value}/>
        </Grid>
      </Grid>
  );
});

export default connect<RenderProps, DispatchProps, OwnProps, IState>(
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
