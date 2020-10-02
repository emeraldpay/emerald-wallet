import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme, Grid, Typography} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {UnsignedBitcoinTx} from "@emeraldpay/emerald-vault-core";
import {BlockchainCode} from "@emeraldwallet/core";
import {CoinAvatar, Address} from "@emeraldwallet/ui";
import {CreateBitcoinTx} from "@emeraldwallet/core/lib/workflow";
import {BigAmount} from "@emeraldpay/bigamount";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({})
);

/**
 *
 */
const Component = (({blockchain, create}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <Grid container={true}>
    <Grid item={true} xs={1}>
      <CoinAvatar chain={blockchain} center={true}/>
    </Grid>
    <Grid item={true} xs={11}>
      <Typography variant={"h5"}>
        Sending {create.requiredAmount.toString()} to:
      </Typography>
      <Address address={create.outputs[0].address}/>
    </Grid>
  </Grid>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  blockchain: BlockchainCode,
  create: CreateBitcoinTx<BigAmount>
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));