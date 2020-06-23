import {Button, Grid, TextField, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles} from "@material-ui/core";
import {ConfirmedPasswordInput} from "../../../index";

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
}

const defaults: Partial<OwnProps> = {
  classes: {}
}

function isValidMnemonic(text: string): boolean {
  //TODO verify against BIP-39 list
  return text && text.length > 0 && text.split(" ").length >= 15;
}


/**
 *
 */
const Component = ((props: OwnProps) => {
  props = {...props, ...defaults};
  const styles = useStyles();
  const {classes} = props;

  const [mnemonic, setMnemonic] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [done, setDone] = React.useState(false);

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
          <ConfirmedPasswordInput helperText={
            "(optional) Additional password to protect the secret mnemonic phrase. " +
            "Please save the password, if you lose it you'll be unable to recover your wallet."}
                                  disabled={done}
                                  buttonLabel={"Set password"}
                                  onChange={setPassword}/>
        </Grid>
        <Grid item={true} xs={4}>
          <Button variant={"contained"}
                  disabled={done || !isValidMnemonic(mnemonic)}
                  className={styles.saveButton}
                  color={"primary"}
                  onClick={() => {
                    props.onSubmit(mnemonic, password.length > 0 ? password : undefined);
                    setDone(true);
                  }}>Save</Button>
        </Grid>
      </Grid>
    </Grid>

  </Grid>
})

export default Component;
