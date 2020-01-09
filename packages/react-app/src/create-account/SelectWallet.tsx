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
} from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import {connect} from "react-redux";
import {State} from "@emeraldwallet/store";
import * as React from "react";
import { WalletOp } from "@emeraldpay/emerald-vault-core";
import {BlockchainCode} from "@emeraldwallet/core";
import {AccountSummary} from "../wallets/AccountSummary";

type OwnProps = {
  wallet: WalletOp
}

type RenderProps = {
  wallet: WalletOp,
}

type DispatchProps = {
}

const SelectWallet = ((props: RenderProps & DispatchProps) => {
  const {wallet} = props;

  return (
      <Grid container={true}>
        <Grid item={true} xs={12}>
          <Typography title={wallet.value.name}>
            Adding a support for a new cryptocurrency to the wallet "{wallet.value.name}"
          </Typography>
        </Grid>
        <Grid item={true} xs={12}>
          <AccountSummary wallet={wallet}/>
        </Grid>
      </Grid>
  )
});

export default connect<RenderProps, DispatchProps, OwnProps, State>(
  (state, ownProps) => {
    return {
      wallet: ownProps.wallet
    }
  },
  (dispatch, ownProps) => {
    return {
    }
  }
)((SelectWallet));