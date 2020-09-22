import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Grid, TextField, Typography} from "@material-ui/core";
import {accounts, IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Button, PasswordInput} from "@emeraldwallet/ui";
import {Uuid} from "@emeraldpay/emerald-vault-core";
import {Alert} from "@material-ui/lab";

const useStyles = makeStyles(
  createStyles({
    buttonBox: {
      paddingTop: "20px",
      paddingLeft: "8px",
    },
  })
);

/**
 *
 */
const Component = (({seedId, onUnlock, verifyPassword}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [password, setPassword] = React.useState();
  const [verifying, setVerifying] = React.useState(false);
  const [invalid, setInvalid] = React.useState(false);

  const onVerify = () => {
    setVerifying(true);
    verifyPassword(password)
      .then((valid: boolean) => {
        if (valid) {
          onUnlock(password);
        }
        setInvalid(!valid);
        setVerifying(false);
      })
  }

  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <Typography variant={"h4"}>Password to unlock seed</Typography>
      <Typography>Please provide password to unlock seed {seedId}</Typography>
    </Grid>
    <Grid item={true} xs={6}>
      <PasswordInput
        showPlaceholder={false}
        minLength={1}
        disabled={verifying}
        password={password}
        onChange={setPassword}
      />
    </Grid>
    <Grid item={true} xs={6} className={styles.buttonBox}>
      <Button
        disabled={verifying}
        label={'Unlock'}
        primary={true}
        onClick={() => onVerify()}
      />
    </Grid>
    {invalid && <Grid item={true} xs={6}>
      <Alert severity="error">Invalid password</Alert>
    </Grid>}
  </Grid>
})

// State Properties
type Props = {}
// Actions
type Actions = {
  verifyPassword: (password: string) => Promise<boolean>
}

// Component properties
type OwnProps = {
  seedId: Uuid,
  onUnlock: (password: string) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      verifyPassword: (password) => {
        return new Promise((resolve) => {
          dispatch(accounts.actions.unlockSeed(ownProps.seedId, password, resolve));
        })
      }
    }
  }
)((Component));