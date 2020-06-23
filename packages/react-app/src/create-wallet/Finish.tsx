import {connect} from "react-redux";
import {IState} from "@emeraldwallet/store";
import {Dispatch} from "react";
import * as React from 'react';
import {Button, Typography, Grid} from "@material-ui/core";
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';

type Props = {}
type Actions = {}

/**
 * Final screen for a wallet creation. Provides info and a button to go to the newly created wallet.
 */
const Component = (({id}: Props & Actions & OwnProps) => {
  return <Grid container={true}>
    <Grid item={true} xs={10}>
      <Typography variant={"h4"}>
        <AssignmentTurnedInIcon/> Wallet created
      </Typography>
      <Typography variant={"subtitle2"}>
        Wallet ID: {id}
      </Typography>
      <Typography variant={"body1"}>
        The wallet is successfully created. Now you can use it to receive and send cryptocurrency.
      </Typography>
    </Grid>
  </Grid>
})

type OwnProps = {
  id: string
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));