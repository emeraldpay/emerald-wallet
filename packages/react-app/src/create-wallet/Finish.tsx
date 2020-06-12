import {connect} from "react-redux";
import {IState} from "@emeraldwallet/store";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, Button, TextField, Typography} from "@material-ui/core";

type Props = {}
type Actions = {}

/**
 * Final screen for a wallet creation. Provides info and a button to go to the newly created wallet.
 */
const Component = (({id, onOpen}: Props & Actions & OwnProps) => {
  return <Box>
    <Typography variant={"h4"}>Wallet created</Typography>
    <Button variant={"contained"} color={"primary"} onClick={() => onOpen()}>Open Wallet</Button>
  </Box>
})

type OwnProps = {
  id: string,
  onOpen: () => void
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));