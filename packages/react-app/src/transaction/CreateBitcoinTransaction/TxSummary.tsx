import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme, Grid, Typography} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {UnsignedBitcoinTx} from "@emeraldpay/emerald-vault-core";
import {amountFactory, BlockchainCode} from "@emeraldwallet/core";
import {CoinAvatar, Address} from "@emeraldwallet/ui";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({})
);

/**
 *
 */
const Component = (({blockchain, tx}: Props & Actions & OwnProps) => {
  const styles = useStyles();

  const amountCreate = amountFactory(blockchain);
  const send = tx.outputs[0].amount;
  if (tx.outputs.length > 2 || tx.outputs.length == 0) {
    console.error("Invalid outputs", tx.outputs)
  }

  return <Grid container={true}>
    <Grid item={true} xs={1}>
      <CoinAvatar chain={blockchain} center={true}/>
    </Grid>
    <Grid item={true} xs={11}>
      <Typography variant={"h5"}>
        Sending {amountCreate(send).toString()} to:
      </Typography>
      <Address address={tx.outputs[0].address}/>
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
  tx: UnsignedBitcoinTx,
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));