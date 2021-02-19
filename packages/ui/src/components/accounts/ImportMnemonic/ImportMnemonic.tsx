import {Button, createStyles, Grid, TextField, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {ConfirmedPasswordInput} from "../../../index";
import {WithDefaults} from "@emeraldwallet/core";

const useStyles = makeStyles(
  createStyles({
    saveButton: {
      width: "200px",
      margin: "5px"
    },
  })
);

// Component properties
interface OwnProps {
  classes?: any;
  onSubmit: (mnemonic: string, password: string | undefined) => void;
  isValidMnemonic?: (mnemonic: string) => boolean;
}

const defaults: Partial<OwnProps> = {
  classes: {},
  isValidMnemonic: (mnemonic: string) => false
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const styles = useStyles();
  const {classes} = props;

  const [mnemonic, setMnemonic] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [done, setDone] = React.useState(false);

  const isValidMnemonic = props.isValidMnemonic(mnemonic);

  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <Typography className={classes.mnemonicLabel}>Enter a mnemonic phrase</Typography>
    </Grid>
    <Grid item={true} xs={12}>
      <Grid container={true}>
        <Grid item={true} xs={8}>
          <TextField
            fullWidth={true}
            multiline={true}
            rowsMax={4}
            rows={4}
            value={mnemonic}
            disabled={done}
            onChange={(e) => setMnemonic(e.target.value)}/>
          <ConfirmedPasswordInput
            helperText={
              "(optional) Additional password to protect the secret mnemonic phrase. " +
              "Please save the password, if you lose it you'll be unable to recover your wallet."
            }
            disabled={done}
            buttonLabel={"Set password"}
            onChange={setPassword}
          />
        </Grid>
        <Grid item={true} xs={4}>
          <Button
            variant={"contained"}
            disabled={done || !isValidMnemonic}
            className={styles.saveButton}
            color={"primary"}
            onClick={() => {
              props.onSubmit(mnemonic, password.length > 0 ? password : undefined);
              setDone(true);
            }}
          >
            Save
          </Button>
        </Grid>
      </Grid>
    </Grid>

  </Grid>
})

export default Component;
