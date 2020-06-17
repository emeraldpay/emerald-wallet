import {makeStyles, withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles, Paper, TextField, Typography, Button, Grid} from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";
import {ConfirmedPasswordInput} from "../../../index";


const useStyles = makeStyles(
  createStyles({
    controls: {
      padding: '25px 0 0 20px',
      alignItems: 'center',
    },
    mnemonic: {
      padding: "20px",
      margin: "20px",
      fontSize: "1.2em",
      border: "1px solid #f0f0f0"
    },
    button: {
      width: "220px",
      margin: "5px"
    }
  })
);

// Component properties
interface OwnProps {
  onGenerate?: () => Promise<string>;
  onContinue?: (value: string, password: string | undefined) => void;
  classes?: any;
}

const defaults = {
  classes: {}
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = {...defaults, ...props};
  const styles = useStyles();

  const [mnemonic, setMnemonic] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [done, setDone] = React.useState(false);

  const {classes, onContinue, onGenerate} = props;

  const hasMnemonic = typeof mnemonic == 'string' && mnemonic.length > 0;
  const confirmed = hasMnemonic && confirmation.toLowerCase().replace(/\s+/g, " ").trim() == mnemonic.toLowerCase();

  const warning = hasMnemonic ? <Box>
    <Alert severity="error">
      Please copy and keep this secret phrase ("Mnemonic Phrase") and password, if set, in a safe place.
      Never tell it to anyone. Emerald representative would never ask for it.
      If you lose this phrase, you will not be able to recover your account.
    </Alert>
  </Box> : <Box/>;

  let passwordField;

  if (password && password.length > 0) {
    passwordField = <Alert severity="success">
      Phrase protection password is set.
      <Button variant={"text"} disabled={done} onClick={() => setPassword("")}>Reset</Button>
    </Alert>
  } else {
    passwordField =
      <ConfirmedPasswordInput helperText={"(optional) Additional password to protect the secret mnemonic phrase."}
                              disabled={done}
                              buttonLabel={"Set password"}
                              onChange={setPassword}/>
  }

  let content;
  let title: string;
  let subtitle: string;

  if (confirming) {
    title = "Confirm generated phrase";
    subtitle = "Please enter the secret phrase, to confirm you have saved a copy of it.";
    content = <Box>
      <TextField
        disabled={done}
        fullWidth={true}
        multiline={true}
        rowsMax={4}
        rows={4}
        onChange={(e) => setConfirmation(e.target.value)}
      />
      {passwordField}
    </Box>
  } else {
    // const mnemonicText = hasMnemonic ? mnemonic.split(" ")
    //   .map((word, i) => i + ". " + word)
    //   .join(" ") : "";
    title = "Secret phrase";
    subtitle = "Click `" + (hasMnemonic ? "Regenerate" : "Generate") + "` to create a new phrase."
    content = <Typography variant={"body1"} className={styles.mnemonic}>
      {mnemonic}
    </Typography>
  }

  return <Grid container={true}>
    <Grid item={true} xs={8}>
      <Grid container={true}>
        <Grid item={true} xs={12}><Typography variant={"h4"}>{title}</Typography></Grid>
        <Grid item={true} xs={12}><Typography variant={"subtitle1"}>{subtitle}</Typography></Grid>
        <Grid item={true} xs={12}>{content}</Grid>
        <Grid item={true} xs={12}>{warning}</Grid>
      </Grid>
    </Grid>
    <Grid item={true} xs={4} className={styles.controls}>
      {hasMnemonic && !confirming &&
      <Button color={"primary"}
              disabled={done}
              className={styles.button}
              variant={"contained"}
              onClick={() => setConfirming(true)}>Enter Confirmation</Button>}
      {!confirming &&
      <Button color={hasMnemonic ? "secondary" : "primary"}
              className={styles.button}
              variant={"contained"}
              disabled={confirming || done}
              onClick={() => onGenerate().then(setMnemonic).catch(console.error)}>
        {hasMnemonic ? 'Regenerate' : 'Generate'}
      </Button>}
      {hasMnemonic && confirming &&
      <Button color={"primary"}
              className={styles.button}
              disabled={!confirmed || done}
              variant={"contained"}
              onClick={() => {
                onContinue(mnemonic, password.length > 0 ? password : undefined);
                setDone(true);
              }}>Confirm</Button>}
      {confirming &&
      <Button variant={"text"}
              disabled={done}
              className={styles.button}
              onClick={() => setConfirming(false)}>Cancel</Button>}
    </Grid>
  </Grid>
})

export default Component;