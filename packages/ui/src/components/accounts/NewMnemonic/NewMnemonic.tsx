import {makeStyles, withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles, Paper, TextField, Typography, Button, Grid} from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";


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
  onContinue?: (value: string) => void;
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

  const {classes, onContinue, onGenerate} = props;

  const hasMnemonic = typeof mnemonic == 'string' && mnemonic.length > 0;
  const confirmed = hasMnemonic && confirmation.toLowerCase().replace(/\s+/g, " ").trim() == mnemonic.toLowerCase();

  const warning = hasMnemonic ? <Box>
    <Alert severity="error">
      Please copy and keep this secret phrase ("Mnemonic Phrase") in a safe place.
      Never tell it to anyone. Emerald representative would never ask for it.
      If you lose this phrase, you will not be able to recover your account.
    </Alert>
  </Box> : <Box/>;

  let content

  if (confirming) {
    content = <Box>
      <Typography variant={"h4"}>Confirm generated phrase</Typography>
      <Typography>Please enter the secret phrase, to confirm you have saved a copy of it.</Typography>
      <TextField
        fullWidth={true}
        multiline={true}
        rowsMax={4}
        rows={4}
        onChange={(e) => setConfirmation(e.target.value)}
      />
    </Box>
  } else {
    // const mnemonicText = hasMnemonic ? mnemonic.split(" ")
    //   .map((word, i) => i + ". " + word)
    //   .join(" ") : "";

    content = <div className={classes.formRow}>
      <div className={classes.left}/>
      <div className={classes.right}>
        <div style={{width: '100%'}}>
          <Typography variant={"h4"}>Secret phrase</Typography>
          <Typography variant={"body1"} className={styles.mnemonic}>
            {mnemonic}
          </Typography>
        </div>
      </div>
    </div>
  }

  return <Grid container={true}>
    <Grid item={true} xs={8}>
      <Grid container={true}>
        <Grid item={true} xs={12}>{content}</Grid>
        <Grid item={true} xs={12}>{warning}</Grid>
      </Grid>
    </Grid>
    <Grid item={true} xs={4}>
      <div className={styles.controls}>
        {hasMnemonic && !confirming &&
        <Button color={"primary"}
                className={styles.button}
                variant={"contained"}
                onClick={() => setConfirming(true)}>Enter Confirmation</Button>}
        {!confirming &&
        <Button color={hasMnemonic ? "secondary" : "primary"}
                className={styles.button}
                variant={"contained"}
                disabled={confirming}
                onClick={() => onGenerate().then(setMnemonic).catch(console.error)}>
          {hasMnemonic ? 'Regenerate' : 'Generate'}
        </Button>}
        {hasMnemonic && confirming &&
        <Button color={"primary"}
                className={styles.button}
                disabled={!confirmed}
                variant={"contained"}
                onClick={() => onContinue(mnemonic)}>Confirm</Button>}
        {confirming &&
        <Button variant={"text"}
                className={styles.button}
                onClick={() => setConfirming(false)}>Cancel</Button>}
      </div>
    </Grid>
  </Grid>
})

export default Component;