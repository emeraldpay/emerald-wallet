import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Paper, Grid, Typography} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Uuid} from "@emeraldpay/emerald-vault-core";
import {Alert} from "@material-ui/lab";
import {ConfirmedPasswordInput} from "@emeraldwallet/ui";

const useStyles = makeStyles(
  createStyles({
    // styleName: {
    //  ... css
    // },
  })
);

/**
 *
 */
const Component = (({onPassword}: Props & Actions & OwnProps) => {
  const styles = useStyles();

  return <Grid container={true}>
    <Grid xs={12}>
      <Typography variant={"h4"}>Save Secret Phrase</Typography>
      <Alert severity="info">
        You're about to save an encrypted copy of the secret phrase ("Mnemonic Phrase") generated on the previous step.
        Please make sure you enter a strong and secure password.
      </Alert>
    </Grid>
    <Grid xs={12}>
      <ConfirmedPasswordInput onChange={onPassword} buttonLabel={"Save"}/>
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
  mnemonic: string,
  mnemonicPassword?: string,
  onPassword: (encryptionPassword: string) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));